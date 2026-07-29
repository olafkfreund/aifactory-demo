"""API tests for the inventory reservation service.

Each test uses a unique sku so the process-wide store shared across
requests does not leak state between tests. Expiry-dependent tests
monkeypatch the store clock so they run fast and deterministically.
"""

import uuid
from concurrent.futures import ThreadPoolExecutor

from fastapi.testclient import TestClient

from app.main import app, store

client = TestClient(app)


def _sku() -> str:
    """Return a sku unique to a single test."""
    return "sku-" + uuid.uuid4().hex


def _create_item(sku: str, total: int) -> dict:
    r = client.post("/items", json={"sku": sku, "total": total})
    assert r.status_code == 201
    return r.json()


def _reserve(sku: str, quantity: int, ttl_seconds: int = 60):
    return client.post(
        f"/items/{sku}/reservations",
        json={"quantity": quantity, "ttl_seconds": ttl_seconds},
    )


# C1 --------------------------------------------------------------------
def test_healthz_returns_ok():
    r = client.get("/healthz")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


# C2 --------------------------------------------------------------------
def test_create_then_get_item_totals():
    sku = _sku()
    created = _create_item(sku, 10)
    assert created == {"sku": sku, "total": 10, "reserved": 0, "available": 10}

    r = client.get(f"/items/{sku}")
    assert r.status_code == 200
    assert r.json() == {"sku": sku, "total": 10, "reserved": 0, "available": 10}


# C3 --------------------------------------------------------------------
def test_reserve_leaves_available_and_reserved():
    sku = _sku()
    _create_item(sku, 10)

    r = _reserve(sku, 3)
    assert r.status_code == 201

    item = client.get(f"/items/{sku}").json()
    assert item["available"] == 7
    assert item["reserved"] == 3


# C4 --------------------------------------------------------------------
def test_reserve_over_total_conflicts_and_leaves_available_unchanged():
    sku = _sku()
    _create_item(sku, 10)

    r = _reserve(sku, 11)
    assert r.status_code == 409

    item = client.get(f"/items/{sku}").json()
    assert item["available"] == 10
    assert item["reserved"] == 0


# C5 --------------------------------------------------------------------
def test_confirm_reduces_total_and_reserved():
    sku = _sku()
    _create_item(sku, 10)
    rid = _reserve(sku, 3).json()["id"]

    r = client.post(f"/reservations/{rid}/confirm")
    assert r.status_code == 200
    assert r.json()["state"] == "confirmed"

    item = client.get(f"/items/{sku}").json()
    assert item["total"] == 7
    assert item["reserved"] == 0


# C6 --------------------------------------------------------------------
def test_delete_active_reservation_releases_stock():
    sku = _sku()
    _create_item(sku, 10)
    rid = _reserve(sku, 10).json()["id"]

    r = client.delete(f"/reservations/{rid}")
    assert r.status_code == 200
    assert r.json()["state"] == "cancelled"

    item = client.get(f"/items/{sku}").json()
    assert item["available"] == 10
    assert item["reserved"] == 0


# C7 --------------------------------------------------------------------
def test_expired_reservation_reports_expired_and_releases_quantity(monkeypatch):
    clock = {"now": 1000.0}
    monkeypatch.setattr(store, "_time_fn", lambda: clock["now"])

    sku = _sku()
    _create_item(sku, 10)
    rid = _reserve(sku, 4, ttl_seconds=5).json()["id"]

    # Still active before ttl elapses.
    assert client.get(f"/reservations/{rid}").json()["state"] == "active"
    assert client.get(f"/items/{sku}").json()["reserved"] == 4

    # Advance the clock beyond the ttl.
    clock["now"] += 6

    assert client.get(f"/reservations/{rid}").json()["state"] == "expired"
    item = client.get(f"/items/{sku}").json()
    assert item["available"] == 10
    assert item["reserved"] == 0


# C8 --------------------------------------------------------------------
def test_confirm_expired_reservation_conflicts(monkeypatch):
    clock = {"now": 2000.0}
    monkeypatch.setattr(store, "_time_fn", lambda: clock["now"])

    sku = _sku()
    _create_item(sku, 10)
    rid = _reserve(sku, 4, ttl_seconds=5).json()["id"]

    clock["now"] += 6

    r = client.post(f"/reservations/{rid}/confirm")
    assert r.status_code == 409


# C9 --------------------------------------------------------------------
def test_confirm_twice_is_idempotent():
    sku = _sku()
    _create_item(sku, 10)
    rid = _reserve(sku, 3).json()["id"]

    r1 = client.post(f"/reservations/{rid}/confirm")
    r2 = client.post(f"/reservations/{rid}/confirm")
    assert r1.status_code == 200
    assert r2.status_code == 200

    # Total decremented exactly once (10 - 3), not twice.
    item = client.get(f"/items/{sku}").json()
    assert item["total"] == 7


# C10 -------------------------------------------------------------------
def test_ttl_seconds_out_of_range_returns_422():
    sku = _sku()
    _create_item(sku, 10)

    assert _reserve(sku, 1, ttl_seconds=0).status_code == 422
    assert _reserve(sku, 1, ttl_seconds=3601).status_code == 422


# C11 -------------------------------------------------------------------
def test_quantity_out_of_range_returns_422():
    sku = _sku()
    _create_item(sku, 10)

    assert _reserve(sku, 0).status_code == 422
    assert _reserve(sku, -1).status_code == 422


# C12 -------------------------------------------------------------------
def test_unknown_sku_and_reservation_return_404():
    assert client.get(f"/items/{_sku()}").status_code == 404
    assert _reserve(_sku(), 1).status_code == 404
    assert client.get(f"/reservations/{uuid.uuid4().hex}").status_code == 404


# C13 -------------------------------------------------------------------
def test_concurrent_reservations_respect_total():
    sku = _sku()
    _create_item(sku, 10)

    def reserve_one(_):
        return _reserve(sku, 1).status_code

    with ThreadPoolExecutor(max_workers=20) as pool:
        statuses = list(pool.map(reserve_one, range(20)))

    assert statuses.count(201) == 10
    assert statuses.count(409) == 10

    item = client.get(f"/items/{sku}").json()
    assert item["reserved"] == 10
    assert item["available"] == 0
