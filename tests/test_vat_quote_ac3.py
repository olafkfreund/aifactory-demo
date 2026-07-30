"""AC3 — discount calculation tests for POST /api/quote.

AC3: ``discount_pct`` is applied to the rounded subtotal before VAT is
computed.  The discount itself is rounded half-up and subtracted from
the subtotal to produce the net amount on which VAT is levied.

Calculation order (from the spec):
  1. subtotal_r = round_half_up(subtotal)
  2. discount_r = round_half_up(subtotal_r * discount_pct / 100)
  3. net_r      = subtotal_r - discount_r
  4. vat_r      = round_half_up(net_r * vat_rate)
  5. total_r    = net_r + vat_r
"""

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.vat_quote import router

_app = FastAPI()
_app.include_router(router)

client = TestClient(_app)


def _quote(**kwargs) -> dict:
    """POST /api/quote and return the parsed JSON body (asserts HTTP 200)."""
    r = client.post("/api/quote", json=kwargs)
    assert r.status_code == 200, r.text
    return r.json()


# ---------------------------------------------------------------------------
# AC3: basic discount applied before VAT
# ---------------------------------------------------------------------------

def test_ac3_ten_percent_discount_reduces_net():
    """10 % discount on 100.00 → discount=10.00, net=90.00."""
    data = _quote(subtotal=100.00, vat_rate=0.0, discount_pct=10)
    assert data["subtotal"] == 100.0
    assert data["discount"] == 10.0
    assert data["net"] == 90.0
    assert data["vat"] == 0.0
    assert data["total"] == 90.0


def test_ac3_discount_applied_before_vat():
    """VAT is levied on net (after discount), not on the gross subtotal."""
    # subtotal=100, discount=10%, net=90, vat=20% of 90=18, total=108
    data = _quote(subtotal=100.00, vat_rate=0.20, discount_pct=10)
    assert data["discount"] == 10.0
    assert data["net"] == 90.0
    assert data["vat"] == 18.0
    assert data["total"] == 108.0


def test_ac3_zero_discount_leaves_net_equal_to_subtotal():
    """discount_pct=0 (the default) must yield discount=0 and net=subtotal."""
    data = _quote(subtotal=55.50, vat_rate=0.0, discount_pct=0)
    assert data["discount"] == 0.0
    assert data["net"] == data["subtotal"]


def test_ac3_full_discount_yields_zero_net_and_total():
    """discount_pct=100 wipes the whole subtotal → net=0, vat=0, total=0."""
    data = _quote(subtotal=75.00, vat_rate=0.20, discount_pct=100)
    assert data["discount"] == 75.0
    assert data["net"] == 0.0
    assert data["vat"] == 0.0
    assert data["total"] == 0.0


def test_ac3_discount_pct_omitted_defaults_to_zero():
    """Omitting discount_pct is equivalent to passing discount_pct=0."""
    with_discount = _quote(subtotal=50.00, vat_rate=0.10, discount_pct=0)
    without_discount = _quote(subtotal=50.00, vat_rate=0.10)
    assert with_discount == without_discount


# ---------------------------------------------------------------------------
# AC3 + AC2: discount itself is rounded half-up
# ---------------------------------------------------------------------------

def test_ac3_discount_rounded_half_up_at_tie():
    """Discount of 0.005 must round to 0.01 (half-up, not to even)."""
    # subtotal_r=100.00, discount=round_half_up(100.00 * 0.005 / 100)
    #                            = round_half_up(0.005) = 0.01
    data = _quote(subtotal=100.00, vat_rate=0.0, discount_pct=0.005)
    assert data["discount"] == 0.01


def test_ac3_discount_rounded_half_up_non_trivial():
    """10.005% discount on 100.00 → discount=10.01 (half-up on 10.005)."""
    # subtotal_r=100.00, discount=round_half_up(100.00 * 10.005 / 100)
    #                            = round_half_up(10.005) = 10.01
    data = _quote(subtotal=100.00, vat_rate=0.0, discount_pct=10.005)
    assert data["discount"] == 10.01
    assert data["net"] == 89.99


def test_ac3_fractional_discount_pct():
    """Fractional discount percentage rounds the computed discount correctly."""
    # subtotal_r=10.00, discount=round_half_up(10.00 * 33 / 100)
    #                           = round_half_up(3.3) = 3.30
    data = _quote(subtotal=10.00, vat_rate=0.0, discount_pct=33)
    assert data["discount"] == 3.30
    assert data["net"] == 6.70


# ---------------------------------------------------------------------------
# AC3 + AC5: net + vat == total still holds with discounts applied
# ---------------------------------------------------------------------------

def test_ac3_ac5_net_plus_vat_equals_total_with_discount():
    """net + vat == total to the penny when a discount is applied."""
    data = _quote(subtotal=149.99, vat_rate=0.175, discount_pct=15)
    assert round(data["net"] + data["vat"], 2) == data["total"]


def test_ac3_ac5_all_fields_two_dp_with_discount():
    """All response fields have exactly 2 decimal places when discounted."""
    data = _quote(subtotal=1.005, vat_rate=0.175, discount_pct=25)
    for field in ("subtotal", "discount", "net", "vat", "total"):
        val = data[field]
        assert val == round(val, 2), (
            f"field '{field}' = {val!r} is not rounded to 2dp"
        )
