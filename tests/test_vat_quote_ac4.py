"""AC4 — input-validation tests for POST /api/quote.

AC4: A negative ``subtotal``, a ``vat_rate`` outside 0..1, or a
``discount_pct`` outside 0..100 returns HTTP 422 and **never** a 500.

These tests complement the baseline AC4 cases in test_vat_quote.py and cover
the lower-bound edge cases ("outside 0..1" means below 0 as well as above 1)
plus missing-field and boundary-exact scenarios.
"""

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.vat_quote import router

_app = FastAPI()
_app.include_router(router)

client = TestClient(_app)


def _post(body: dict) -> int:
    """POST /api/quote and return the HTTP status code."""
    return client.post("/api/quote", json=body).status_code


# ---------------------------------------------------------------------------
# subtotal validation
# ---------------------------------------------------------------------------

def test_ac4_negative_subtotal_422():
    """Negative subtotal must yield 422, not 500."""
    assert _post({"subtotal": -0.01, "vat_rate": 0.2}) == 422


def test_ac4_zero_subtotal_is_valid():
    """subtotal=0 is on the boundary and must be accepted (200)."""
    assert _post({"subtotal": 0, "vat_rate": 0.2}) == 200


# ---------------------------------------------------------------------------
# vat_rate validation — "outside 0..1" means both below 0 AND above 1
# ---------------------------------------------------------------------------

def test_ac4_vat_rate_below_zero_422():
    """Negative vat_rate is outside the 0..1 range — must yield 422."""
    assert _post({"subtotal": 100, "vat_rate": -0.01}) == 422


def test_ac4_vat_rate_exactly_zero_is_valid():
    """vat_rate=0 is the lower boundary — must be accepted (200)."""
    assert _post({"subtotal": 100, "vat_rate": 0}) == 200


def test_ac4_vat_rate_exactly_one_is_valid():
    """vat_rate=1 is the upper boundary — must be accepted (200)."""
    assert _post({"subtotal": 100, "vat_rate": 1}) == 200


def test_ac4_vat_rate_above_one_422():
    """vat_rate>1 is outside range — must yield 422."""
    assert _post({"subtotal": 100, "vat_rate": 1.001}) == 422


# ---------------------------------------------------------------------------
# discount_pct validation — "outside 0..100" includes negative values
# ---------------------------------------------------------------------------

def test_ac4_discount_pct_below_zero_422():
    """Negative discount_pct is outside 0..100 — must yield 422."""
    assert _post({"subtotal": 100, "vat_rate": 0.2, "discount_pct": -0.01}) == 422


def test_ac4_discount_pct_zero_is_valid():
    """discount_pct=0 is the lower boundary — must be accepted (200)."""
    assert _post({"subtotal": 100, "vat_rate": 0.2, "discount_pct": 0}) == 200


def test_ac4_discount_pct_100_is_valid():
    """discount_pct=100 is the upper boundary — must be accepted (200)."""
    assert _post({"subtotal": 100, "vat_rate": 0.2, "discount_pct": 100}) == 200


def test_ac4_discount_pct_above_100_422():
    """discount_pct=100.01 exceeds the cap — must yield 422."""
    assert _post({"subtotal": 100, "vat_rate": 0.2, "discount_pct": 100.01}) == 422


# ---------------------------------------------------------------------------
# Missing required fields must yield 422, not 500
# ---------------------------------------------------------------------------

def test_ac4_missing_subtotal_422():
    """Omitting ``subtotal`` (a required field) must yield 422."""
    assert _post({"vat_rate": 0.2}) == 422


def test_ac4_missing_vat_rate_422():
    """Omitting ``vat_rate`` (a required field) must yield 422."""
    assert _post({"subtotal": 100}) == 422


def test_ac4_empty_body_422():
    """An empty JSON object must yield 422."""
    assert _post({}) == 422
