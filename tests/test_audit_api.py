"""Integration tests for the audit middleware and query endpoint.

Exercises the wired application end-to-end via ``TestClient``:

* AC1 - each handled request produces exactly one audit record capturing the
  method, path, status code, latency and client key.
* AC3 - ``GET /api/audit`` filtering (path prefix, status class, time range) and
  limit/offset pagination.
* AC4 - the audit endpoint excludes itself from recording (no self-amplification).
* AC6 - ``GET /api/audit`` enforces client-key authentication: unauthenticated or
  invalid-key requests are rejected (401/403) and never expose audit records.
"""

from __future__ import annotations

from fastapi.testclient import TestClient

from src.app.audit.middleware import is_excluded_path
from src.app.audit.store import SQLiteAuditStore


# --- record creation (AC1) ---------------------------------------------------


def test_request_creates_exactly_one_record(
    client: TestClient, store: SQLiteAuditStore
) -> None:
    resp = client.get("/api/things", headers={"x-client-key": "abc123"})
    assert resp.status_code == 200

    assert store.count() == 1
    (record,) = store.query()
    assert record.method == "GET"
    assert record.path == "/api/things"
    assert record.status_code == 200
    assert record.client_key == "abc123"
    assert record.latency_ms >= 0.0
    assert record.timestamp


def test_each_request_records_once(
    client: TestClient, store: SQLiteAuditStore
) -> None:
    for _ in range(3):
        client.get("/api/things")
    assert store.count() == 3


def test_records_method_and_status_for_writes(
    client: TestClient, store: SQLiteAuditStore
) -> None:
    resp = client.post("/api/things")
    assert resp.status_code == 201

    (record,) = store.query()
    assert record.method == "POST"
    assert record.status_code == 201


def test_client_key_is_null_when_header_absent(
    client: TestClient, store: SQLiteAuditStore
) -> None:
    client.get("/api/things")
    (record,) = store.query()
    assert record.client_key is None


def test_error_responses_are_recorded(
    client: TestClient, store: SQLiteAuditStore
) -> None:
    assert client.get("/api/missing").status_code == 404
    assert client.get("/api/broken").status_code == 500

    statuses = {r.status_code for r in store.query()}
    assert statuses == {404, 500}


# --- self-exclusion (AC4) ----------------------------------------------------


def test_audit_endpoint_is_not_recorded(
    client: TestClient, store: SQLiteAuditStore, auth_headers: dict[str, str]
) -> None:
    # Repeated reads of the trail must not append records to it.
    for _ in range(3):
        assert client.get("/api/audit", headers=auth_headers).status_code == 200
    assert store.count() == 0


def test_self_exclusion_does_not_suppress_other_paths(
    client: TestClient, store: SQLiteAuditStore, auth_headers: dict[str, str]
) -> None:
    client.get("/api/things")
    client.get("/api/audit", headers=auth_headers)
    client.get("/api/widgets")

    paths = {r.path for r in store.query()}
    assert paths == {"/api/things", "/api/widgets"}


def test_is_excluded_path_matches_only_the_audit_endpoint() -> None:
    assert is_excluded_path("/api/audit") is True
    assert is_excluded_path("/api/audit/") is True
    assert is_excluded_path("/api/audit/export") is True
    # A path that merely shares the textual prefix is still recorded.
    assert is_excluded_path("/api/auditors") is False
    assert is_excluded_path("/api/things") is False


# --- query endpoint filters (AC3) --------------------------------------------


def _items(resp) -> list[dict]:
    return resp.json()["items"]


def test_endpoint_returns_records_newest_first(
    client: TestClient, store: SQLiteAuditStore, auth_headers: dict[str, str]
) -> None:
    client.get("/api/things")
    client.get("/api/widgets")

    body = client.get("/api/audit", headers=auth_headers).json()
    assert body["count"] == 2
    assert [item["path"] for item in body["items"]] == ["/api/widgets", "/api/things"]


def test_endpoint_filters_by_path_prefix(
    client: TestClient, store: SQLiteAuditStore, auth_headers: dict[str, str]
) -> None:
    client.get("/api/things")
    client.get("/api/widgets")

    resp = client.get(
        "/api/audit", params={"path_prefix": "/api/wid"}, headers=auth_headers
    )
    assert [item["path"] for item in _items(resp)] == ["/api/widgets"]


def test_endpoint_filters_by_status_class(
    client: TestClient, store: SQLiteAuditStore, auth_headers: dict[str, str]
) -> None:
    client.get("/api/things")  # 200
    client.get("/api/missing")  # 404
    client.get("/api/broken")  # 500

    ok = client.get("/api/audit", params={"status_class": "2xx"}, headers=auth_headers)
    assert [item["status_code"] for item in _items(ok)] == [200]

    client_err = client.get(
        "/api/audit", params={"status_class": "4xx"}, headers=auth_headers
    )
    assert [item["status_code"] for item in _items(client_err)] == [404]

    server_err = client.get(
        "/api/audit", params={"status_class": "5xx"}, headers=auth_headers
    )
    assert [item["status_code"] for item in _items(server_err)] == [500]


def test_endpoint_rejects_invalid_status_class(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    resp = client.get(
        "/api/audit", params={"status_class": "9xx"}, headers=auth_headers
    )
    assert resp.status_code == 422


def test_endpoint_filters_by_time_range(
    client: TestClient, store: SQLiteAuditStore, auth_headers: dict[str, str]
) -> None:
    # Seed records with controlled timestamps directly through the store.
    from src.app.audit.models import AuditRecord

    store.append(AuditRecord("GET", "/early", 200, 1.0, timestamp="2026-01-01T00:00:00+00:00"))
    store.append(AuditRecord("GET", "/mid", 200, 1.0, timestamp="2026-06-01T00:00:00+00:00"))
    store.append(AuditRecord("GET", "/late", 200, 1.0, timestamp="2026-12-01T00:00:00+00:00"))

    resp = client.get(
        "/api/audit",
        params={"from": "2026-03-01T00:00:00+00:00", "to": "2026-09-01T00:00:00+00:00"},
        headers=auth_headers,
    )
    assert [item["path"] for item in _items(resp)] == ["/mid"]


def test_endpoint_paginates_with_limit_and_offset(
    client: TestClient, store: SQLiteAuditStore, auth_headers: dict[str, str]
) -> None:
    for _ in range(5):
        client.get("/api/things")

    first = client.get(
        "/api/audit", params={"limit": 2, "offset": 0}, headers=auth_headers
    ).json()
    assert first["count"] == 2
    assert first["limit"] == 2
    assert first["offset"] == 0
    first_ids = [item["id"] for item in first["items"]]

    second = client.get(
        "/api/audit", params={"limit": 2, "offset": 2}, headers=auth_headers
    ).json()
    second_ids = [item["id"] for item in second["items"]]

    # Pages are disjoint and ordered newest-first (descending ids).
    assert set(first_ids).isdisjoint(second_ids)
    assert first_ids == sorted(first_ids, reverse=True)
    assert min(first_ids) > max(second_ids)


def test_endpoint_rejects_out_of_range_limit(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    assert (
        client.get("/api/audit", params={"limit": -1}, headers=auth_headers).status_code
        == 422
    )
    assert (
        client.get(
            "/api/audit", params={"limit": 10_000}, headers=auth_headers
        ).status_code
        == 422
    )


# --- client-key authentication (AC6) -----------------------------------------


def test_audit_endpoint_rejects_missing_client_key(
    client: TestClient, store: SQLiteAuditStore
) -> None:
    # Seed a record so we can prove it is never leaked to an unauthenticated call.
    client.get("/api/things")

    resp = client.get("/api/audit")
    assert resp.status_code == 401
    # No audit records are exposed to an unauthenticated caller.
    assert "items" not in resp.json()


def test_audit_endpoint_rejects_invalid_client_key(
    client: TestClient, store: SQLiteAuditStore
) -> None:
    client.get("/api/things")

    resp = client.get("/api/audit", headers={"x-client-key": "wrong-key"})
    assert resp.status_code == 403
    assert "items" not in resp.json()


def test_audit_endpoint_allows_valid_client_key(
    client: TestClient, store: SQLiteAuditStore, auth_headers: dict[str, str]
) -> None:
    client.get("/api/things")

    resp = client.get("/api/audit", headers=auth_headers)
    assert resp.status_code == 200
    assert [item["path"] for item in _items(resp)] == ["/api/things"]


def test_audit_records_never_exposed_unauthenticated(
    client: TestClient, store: SQLiteAuditStore
) -> None:
    # Populate the trail with several records.
    for _ in range(3):
        client.get("/api/things")
    assert store.count() == 3

    # Neither a missing key nor an invalid key returns any record payload.
    for headers in ({}, {"x-client-key": "nope"}):
        resp = client.get("/api/audit", headers=headers)
        assert resp.status_code in (401, 403)
        body = resp.json()
        assert "items" not in body
        assert "/api/things" not in resp.text
