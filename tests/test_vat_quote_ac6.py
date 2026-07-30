"""AC6 — non-finite input tests for POST /api/quote.

AC6: NaN and ±infinity must be rejected with HTTP 422 for every numeric
field (``subtotal``, ``vat_rate``, ``discount_pct``).

The ``_must_be_finite`` field-validator in ``app.vat_quote`` catches these
before Pydantic's range constraints run, producing a clear 422 error rather
than a 500 or a silent wrong result.

Standard JSON does not include NaN or ±Infinity literals, but Python's
``json`` parser (used internally by FastAPI / Starlette) accepts the
non-standard tokens ``NaN``, ``Infinity``, and ``-Infinity``.  We therefore
send requests as raw JSON bytes rather than using the httpx ``json=`` helper
(which would raise a ``ValueError`` before the request is even dispatched).
"""

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.vat_quote import router

_app = FastAPI()
_app.include_router(router)

client = TestClient(_app)

_JSON_HEADERS = {"Content-Type": "application/json"}


def _post_raw(raw_json: str) -> int:
    """POST /api/quote with a hand-crafted JSON string; return the HTTP status code."""
    return client.post(
        "/api/quote",
        content=raw_json.encode(),
        headers=_JSON_HEADERS,
    ).status_code


# ---------------------------------------------------------------------------
# AC6: subtotal — non-finite values must yield 422
# ---------------------------------------------------------------------------


def test_ac6_subtotal_nan_returns_422():
    """NaN subtotal must be rejected with 422, not produce a wrong result."""
    assert _post_raw('{"subtotal": NaN, "vat_rate": 0.2}') == 422


def test_ac6_subtotal_positive_infinity_returns_422():
    """+∞ subtotal must be rejected with 422."""
    assert _post_raw('{"subtotal": Infinity, "vat_rate": 0.2}') == 422


def test_ac6_subtotal_negative_infinity_returns_422():
    """-∞ subtotal must be rejected with 422."""
    assert _post_raw('{"subtotal": -Infinity, "vat_rate": 0.2}') == 422


# ---------------------------------------------------------------------------
# AC6: vat_rate — non-finite values must yield 422
# ---------------------------------------------------------------------------


def test_ac6_vat_rate_nan_returns_422():
    """NaN vat_rate must be rejected with 422."""
    assert _post_raw('{"subtotal": 100.0, "vat_rate": NaN}') == 422


def test_ac6_vat_rate_positive_infinity_returns_422():
    """+∞ vat_rate must be rejected with 422."""
    assert _post_raw('{"subtotal": 100.0, "vat_rate": Infinity}') == 422


def test_ac6_vat_rate_negative_infinity_returns_422():
    """-∞ vat_rate must be rejected with 422."""
    assert _post_raw('{"subtotal": 100.0, "vat_rate": -Infinity}') == 422


# ---------------------------------------------------------------------------
# AC6: discount_pct — non-finite values must yield 422
# ---------------------------------------------------------------------------


def test_ac6_discount_pct_nan_returns_422():
    """NaN discount_pct must be rejected with 422."""
    assert _post_raw('{"subtotal": 100.0, "vat_rate": 0.2, "discount_pct": NaN}') == 422


def test_ac6_discount_pct_positive_infinity_returns_422():
    """+∞ discount_pct must be rejected with 422."""
    assert _post_raw('{"subtotal": 100.0, "vat_rate": 0.2, "discount_pct": Infinity}') == 422


def test_ac6_discount_pct_negative_infinity_returns_422():
    """-∞ discount_pct must be rejected with 422."""
    assert _post_raw('{"subtotal": 100.0, "vat_rate": 0.2, "discount_pct": -Infinity}') == 422


# ---------------------------------------------------------------------------
# AC6: sanity — finite boundary values are still accepted (200)
# ---------------------------------------------------------------------------


def test_ac6_finite_boundary_subtotal_zero_is_accepted():
    """subtotal=0.0 (finite lower bound) must still yield 200."""
    assert _post_raw('{"subtotal": 0.0, "vat_rate": 0.2}') == 200


def test_ac6_finite_boundary_subtotal_max_is_accepted():
    """subtotal=1_000_000 (finite upper bound) must still yield 200."""
    assert _post_raw('{"subtotal": 1000000, "vat_rate": 0.2}') == 200


def test_ac6_finite_vat_rate_zero_is_accepted():
    """vat_rate=0 (finite lower bound) must still yield 200."""
    assert _post_raw('{"subtotal": 50.0, "vat_rate": 0.0}') == 200


def test_ac6_finite_vat_rate_one_is_accepted():
    """vat_rate=1 (finite upper bound) must still yield 200."""
    assert _post_raw('{"subtotal": 50.0, "vat_rate": 1.0}') == 200
