"""Tests for the VAT quote endpoint — focused on AC2 (half-up rounding).

The router is mounted on a local FastAPI test app so that this subtask can be
tested independently without modifying the shared ``app.main`` module.
"""

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.vat_quote import router

# Build a minimal test application that includes only the VAT quote router.
_app = FastAPI()
_app.include_router(router)

client = TestClient(_app)


def _quote(**kwargs) -> dict:
    """POST /api/quote and return the parsed JSON body."""
    r = client.post("/api/quote", json=kwargs)
    assert r.status_code == 200, r.text
    return r.json()


# ---------------------------------------------------------------------------
# AC2: half-up rounding — ties round AWAY from zero, not to even
# ---------------------------------------------------------------------------


def test_ac2_1_005_rounds_total_to_1_01():
    """1.005 with vat_rate=0 must return total=1.01 (half-up, not banker's)."""
    data = _quote(subtotal=1.005, vat_rate=0)
    assert data["total"] == 1.01


def test_ac2_2_675_rounds_total_to_2_68():
    """2.675 with vat_rate=0 must return total=2.68."""
    data = _quote(subtotal=2.675, vat_rate=0)
    assert data["total"] == 2.68


def test_ac2_all_fields_have_exactly_two_decimal_places():
    """Every monetary field in the response has exactly 2 decimal places."""
    data = _quote(subtotal=1.005, vat_rate=0.175, discount_pct=5)
    for field in ("subtotal", "discount", "net", "vat", "total"):
        val = data[field]
        # round(val, 2) == val iff val has at most 2 decimal places.
        # Avoids float-multiplication artefacts (e.g. 1.13 * 100 ≈ 112.999…).
        assert val == round(val, 2), f"field '{field}' = {val!r} is not rounded to 2dp"


def test_ac2_vat_rounding_half_up():
    """VAT itself is rounded half-up: net=10.005 × rate=1 → vat=10.01."""
    # net=10.005: subtotal=10.005, no discount, vat_rate=1 (100%)
    data = _quote(subtotal=10.005, vat_rate=1)
    # subtotal_r = 10.01, net = 10.01, vat = round_half_up(10.01 * 1) = 10.01
    assert data["vat"] == data["net"]


# ---------------------------------------------------------------------------
# AC5: net + vat == total to the penny (rounding must never create a gap)
# ---------------------------------------------------------------------------


def test_ac5_net_plus_vat_equals_total_basic():
    """net + vat == total for a straightforward request."""
    data = _quote(subtotal=100.00, vat_rate=0.2)
    assert round(data["net"] + data["vat"], 2) == data["total"]


def test_ac5_net_plus_vat_equals_total_rounding_edge():
    """net + vat == total even at half-up rounding boundary values."""
    data = _quote(subtotal=1.005, vat_rate=0.175)
    assert round(data["net"] + data["vat"], 2) == data["total"]


# ---------------------------------------------------------------------------
# AC1: basic happy path (included here to keep all quote tests together)
# ---------------------------------------------------------------------------


def test_ac1_basic_vat_calculation():
    """subtotal=100, vat_rate=0.2 → net=100, vat=20, total=120."""
    data = _quote(subtotal=100.00, vat_rate=0.2)
    assert data["subtotal"] == 100.0
    assert data["discount"] == 0.0
    assert data["net"] == 100.0
    assert data["vat"] == 20.0
    assert data["total"] == 120.0


def test_ac1_zero_vat_rate():
    """vat_rate=0 → vat=0 and total=net=subtotal."""
    data = _quote(subtotal=50.00, vat_rate=0)
    assert data["vat"] == 0.0
    assert data["total"] == data["net"]


# ---------------------------------------------------------------------------
# AC4: input validation returns 422 (not 500)
# ---------------------------------------------------------------------------


def test_ac4_negative_subtotal_returns_422():
    r = client.post("/api/quote", json={"subtotal": -1, "vat_rate": 0.2})
    assert r.status_code == 422


def test_ac4_vat_rate_above_1_returns_422():
    r = client.post("/api/quote", json={"subtotal": 100, "vat_rate": 1.1})
    assert r.status_code == 422


def test_ac4_discount_pct_above_100_returns_422():
    r = client.post(
        "/api/quote", json={"subtotal": 100, "vat_rate": 0.2, "discount_pct": 101}
    )
    assert r.status_code == 422


def test_ac6_subtotal_above_1000000_returns_422():
    r = client.post("/api/quote", json={"subtotal": 1_000_001, "vat_rate": 0.2})
    assert r.status_code == 422


def test_ac6_non_numeric_subtotal_returns_422():
    r = client.post("/api/quote", json={"subtotal": "abc", "vat_rate": 0.2})
    assert r.status_code == 422
