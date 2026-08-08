"""Tests for the X-Request-ID correlation middleware (AC#1 and AC#2).

AC#1: When the client supplies an X-Request-ID request header the middleware
      echoes the same value verbatim in the X-Request-ID response header.

AC#2: When the client supplies no X-Request-ID header the middleware generates
      a UUID4 and returns it in the X-Request-ID response header.
"""

import re
import uuid

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

_UUID4_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
)


# ---------------------------------------------------------------------------
# AC#1 — echo the client-supplied header
# ---------------------------------------------------------------------------


def test_supplied_request_id_is_echoed_in_response():
    """X-Request-ID sent by the client is returned verbatim in the response."""
    request_id = "my-correlation-id-123"
    resp = client.get("/", headers={"X-Request-ID": request_id})
    assert resp.status_code == 200
    assert resp.headers["X-Request-ID"] == request_id


def test_supplied_request_id_echoed_on_healthz():
    """X-Request-ID echoing works on /healthz, not just /."""
    request_id = "healthz-test-id"
    resp = client.get("/healthz", headers={"X-Request-ID": request_id})
    assert resp.status_code == 200
    assert resp.headers["X-Request-ID"] == request_id


def test_supplied_request_id_echoed_on_post():
    """X-Request-ID echoing works on POST endpoints."""
    request_id = "post-correlation-42"
    resp = client.post(
        "/items",
        json={"sku": "sku-echo-test", "total": 5},
        headers={"X-Request-ID": request_id},
    )
    assert resp.status_code == 201
    assert resp.headers["X-Request-ID"] == request_id


def test_supplied_request_id_with_uuid_format_is_echoed():
    """A client-supplied UUID4-formatted ID is echoed without modification."""
    request_id = str(uuid.uuid4())
    resp = client.get("/", headers={"X-Request-ID": request_id})
    assert resp.headers["X-Request-ID"] == request_id


def test_different_supplied_ids_are_each_echoed_correctly():
    """Each distinct client-supplied ID is echoed back on its own response."""
    id_a = "request-id-aaa"
    id_b = "request-id-bbb"

    resp_a = client.get("/", headers={"X-Request-ID": id_a})
    resp_b = client.get("/", headers={"X-Request-ID": id_b})

    assert resp_a.headers["X-Request-ID"] == id_a
    assert resp_b.headers["X-Request-ID"] == id_b


# ---------------------------------------------------------------------------
# AC#2 — generate UUID4 when the header is absent
# ---------------------------------------------------------------------------


def test_missing_request_id_generates_uuid4_in_response():
    """When X-Request-ID is absent the response header contains a UUID4."""
    resp = client.get("/")
    assert resp.status_code == 200
    assert "X-Request-ID" in resp.headers
    assert _UUID4_RE.match(resp.headers["X-Request-ID"]), (
        f"Expected UUID4, got {resp.headers['X-Request-ID']!r}"
    )


def test_missing_request_id_on_healthz_generates_uuid4():
    """Auto-generated UUID4 is present on /healthz responses too."""
    resp = client.get("/healthz")
    assert "X-Request-ID" in resp.headers
    assert _UUID4_RE.match(resp.headers["X-Request-ID"])


def test_each_request_without_id_gets_unique_uuid4():
    """Two requests without X-Request-ID each receive a distinct UUID4."""
    resp_1 = client.get("/")
    resp_2 = client.get("/")

    id_1 = resp_1.headers["X-Request-ID"]
    id_2 = resp_2.headers["X-Request-ID"]

    assert id_1 != id_2, "Each request should receive a unique correlation ID"


def test_auto_generated_id_is_version_4_uuid():
    """The auto-generated ID is a valid UUID4 (version field == 4)."""
    resp = client.get("/")
    generated = resp.headers["X-Request-ID"]
    parsed = uuid.UUID(generated)
    assert parsed.version == 4
