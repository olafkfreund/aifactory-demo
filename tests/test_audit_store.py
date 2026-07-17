"""Unit tests for the persistent audit store (AC2 and AC3 filters).

Covers record creation/round-tripping, persistence across a simulated process
restart, and every supported query filter: path prefix, status class, the
inclusive from/to time range and limit/offset pagination.
"""

from __future__ import annotations

from src.app.audit.models import AuditRecord, StatusClass
from src.app.audit.store import SQLiteAuditStore


def _record(
    *,
    method: str = "GET",
    path: str = "/api/things",
    status_code: int = 200,
    latency_ms: float = 1.5,
    client_key: str | None = "key-1",
    timestamp: str | None = None,
) -> AuditRecord:
    kwargs: dict = {
        "method": method,
        "path": path,
        "status_code": status_code,
        "latency_ms": latency_ms,
        "client_key": client_key,
    }
    if timestamp is not None:
        kwargs["timestamp"] = timestamp
    return AuditRecord(**kwargs)


# --- record creation / round-trip --------------------------------------------


def test_append_assigns_id_and_persists_all_fields(store: SQLiteAuditStore) -> None:
    saved = store.append(
        _record(method="POST", path="/api/things", status_code=201, latency_ms=4.2)
    )

    assert saved.id is not None
    assert store.count() == 1

    (loaded,) = store.query()
    assert loaded.id == saved.id
    assert loaded.method == "POST"
    assert loaded.path == "/api/things"
    assert loaded.status_code == 201
    assert loaded.latency_ms == 4.2
    assert loaded.client_key == "key-1"
    assert loaded.timestamp


def test_append_autoincrements_ids(store: SQLiteAuditStore) -> None:
    first = store.append(_record())
    second = store.append(_record())
    assert second.id == first.id + 1


def test_query_returns_newest_first(store: SQLiteAuditStore) -> None:
    store.append(_record(path="/api/a"))
    store.append(_record(path="/api/b"))
    store.append(_record(path="/api/c"))

    paths = [r.path for r in store.query()]
    assert paths == ["/api/c", "/api/b", "/api/a"]


# --- persistence across restart (AC2) ----------------------------------------


def test_records_persist_across_restart(db_path: str) -> None:
    first = SQLiteAuditStore(db_path)
    try:
        first.append(_record(path="/api/kept", status_code=200))
        first.append(_record(path="/api/kept-too", status_code=404))
    finally:
        first.close()

    # A brand-new store object pointed at the same file simulates a restart.
    second = SQLiteAuditStore(db_path)
    try:
        assert second.count() == 2
        paths = {r.path for r in second.query()}
        assert paths == {"/api/kept", "/api/kept-too"}
    finally:
        second.close()


# --- path prefix filter (AC3) ------------------------------------------------


def test_query_filters_by_path_prefix(store: SQLiteAuditStore) -> None:
    store.append(_record(path="/api/things"))
    store.append(_record(path="/api/things/42"))
    store.append(_record(path="/api/widgets"))

    results = store.query(path_prefix="/api/things")
    assert {r.path for r in results} == {"/api/things", "/api/things/42"}


def test_path_prefix_treats_wildcards_literally(store: SQLiteAuditStore) -> None:
    store.append(_record(path="/api/50%off"))
    store.append(_record(path="/api/50zoff"))

    results = store.query(path_prefix="/api/50%")
    assert [r.path for r in results] == ["/api/50%off"]


# --- status class filter (AC3) -----------------------------------------------


def test_query_filters_by_status_class(store: SQLiteAuditStore) -> None:
    store.append(_record(path="/ok", status_code=200))
    store.append(_record(path="/created", status_code=201))
    store.append(_record(path="/missing", status_code=404))
    store.append(_record(path="/boom", status_code=500))

    success = store.query(status_class=StatusClass.SUCCESS)
    assert {r.status_code for r in success} == {200, 201}

    client_errors = store.query(status_class="4xx")
    assert [r.status_code for r in client_errors] == [404]

    server_errors = store.query(status_class="5xx")
    assert [r.status_code for r in server_errors] == [500]


# --- time range filter (AC3) -------------------------------------------------


def test_query_filters_by_time_range_inclusive(store: SQLiteAuditStore) -> None:
    store.append(_record(path="/early", timestamp="2026-07-17T08:00:00+00:00"))
    store.append(_record(path="/mid", timestamp="2026-07-17T12:00:00+00:00"))
    store.append(_record(path="/late", timestamp="2026-07-17T18:00:00+00:00"))

    windowed = store.query(
        time_from="2026-07-17T12:00:00+00:00",
        time_to="2026-07-17T18:00:00+00:00",
    )
    assert {r.path for r in windowed} == {"/mid", "/late"}

    only_from = store.query(time_from="2026-07-17T12:00:00+00:00")
    assert {r.path for r in only_from} == {"/mid", "/late"}

    only_to = store.query(time_to="2026-07-17T12:00:00+00:00")
    assert {r.path for r in only_to} == {"/early", "/mid"}


# --- limit / offset pagination (AC3) -----------------------------------------


def test_query_limit_and_offset_paginate(store: SQLiteAuditStore) -> None:
    for i in range(5):
        store.append(_record(path=f"/api/item/{i}"))

    # Newest first: item/4, item/3, item/2, item/1, item/0
    page_one = store.query(limit=2, offset=0)
    assert [r.path for r in page_one] == ["/api/item/4", "/api/item/3"]

    page_two = store.query(limit=2, offset=2)
    assert [r.path for r in page_two] == ["/api/item/2", "/api/item/1"]

    page_three = store.query(limit=2, offset=4)
    assert [r.path for r in page_three] == ["/api/item/0"]


def test_query_combines_filters(store: SQLiteAuditStore) -> None:
    store.append(_record(path="/api/things", status_code=200))
    store.append(_record(path="/api/things", status_code=500))
    store.append(_record(path="/api/widgets", status_code=200))

    results = store.query(path_prefix="/api/things", status_class="2xx")
    assert [r.path for r in results] == ["/api/things"]
    assert [r.status_code for r in results] == [200]
