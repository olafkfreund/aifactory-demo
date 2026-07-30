"""VAT quote endpoint with half-up money rounding.

Endpoint: POST /api/quote

Request body:
    {"subtotal": <number, GBP>, "vat_rate": <number, 0..1>,
     "discount_pct": <number, 0..100, optional, default 0>}

Response 200:
    {"subtotal": <number>, "discount": <number>, "net": <number>,
     "vat": <number>, "total": <number>}

All five response values are GBP amounts with exactly 2 decimal places,
rounded using HALF_UP (ties round away from zero).

Calculation order (order matters for penny-exact totals):
  1. Round the submitted subtotal to 2dp.
  2. discount  = round_half_up(subtotal_r * discount_pct / 100)
  3. net       = subtotal_r - discount_r          (already 2dp)
  4. vat       = round_half_up(net * vat_rate)
  5. total     = net + vat                        (already 2dp; net+vat=total to the penny)

AC7 — access control decision:
  This endpoint is intentionally unauthenticated because it is a pure
  stateless calculator over values in the request body. It MUST NOT read
  or write any database, file, secret or credential, and MUST NOT accept
  an identifier that could select another caller's data.
"""

from __future__ import annotations

import math
from decimal import ROUND_HALF_UP, Decimal

from fastapi import APIRouter
from pydantic import BaseModel, Field, field_validator

router = APIRouter()

# Two-decimal-place quantiser — the target unit for all money amounts.
_CENTS = Decimal("0.01")


def _d(value: float) -> Decimal:
    """Convert *value* to ``Decimal`` via its string representation.

    Using ``str()`` avoids binary-float imprecision: ``str(1.005)`` →
    ``'1.005'``, so ``Decimal('1.005').quantize(…, ROUND_HALF_UP)`` → 1.01
    as AC2 requires.  Never pass ``float`` directly to ``Decimal()`` — that
    captures the binary approximation (``Decimal(1.005)`` ≈ 1.00499…).
    """
    return Decimal(str(value))


def _round(value: Decimal) -> Decimal:
    """Round *value* to 2 decimal places using HALF_UP (ties away from zero)."""
    return value.quantize(_CENTS, rounding=ROUND_HALF_UP)


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------


class QuoteRequest(BaseModel):
    subtotal: float = Field(ge=0, le=1_000_000)
    vat_rate: float = Field(ge=0, le=1)
    discount_pct: float = Field(default=0, ge=0, le=100)

    @field_validator("subtotal", "vat_rate", "discount_pct", mode="before")
    @classmethod
    def _must_be_finite(cls, v: object) -> object:
        """Reject NaN and ±infinity before the ge/le constraints run (AC6).

        Pydantic's ge/le comparisons with NaN silently return False, so we
        must catch non-finite values explicitly.

        Implementation note — return, do not raise:
          Raising ``ValueError`` here would embed the original NaN/±inf
          Python float in the Pydantic ``ValidationError``'s ``input`` field.
          FastAPI then tries to serialise that error detail with
          ``json.dumps``, which rejects NaN/±inf by default (they are not
          valid JSON).  The result is a 500-level crash rather than a clean
          422.

          Instead we *return* a non-numeric sentinel string.  Pydantic's
          subsequent float-coercion step will fail to parse it, raising the
          type-validation error itself with ``input="non-finite"`` — a
          JSON-safe value — so the 422 response is always serialisable.
        """
        if isinstance(v, float) and not math.isfinite(v):
            # The sentinel is intentionally un-coercible to float so Pydantic
            # emits a type error.  Do NOT change to raise ValueError — see
            # note above about response serialisation.
            return "non-finite"
        return v


class QuoteResponse(BaseModel):
    subtotal: float
    discount: float
    net: float
    vat: float
    total: float


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------


@router.post("/api/quote", response_model=QuoteResponse)
async def vat_quote(body: QuoteRequest) -> dict:
    """Compute a VAT-inclusive price quote with half-up rounding (AC1–AC7)."""
    subtotal_r = _round(_d(body.subtotal))
    discount_r = _round(subtotal_r * _d(body.discount_pct) / Decimal("100"))
    net_r = subtotal_r - discount_r          # already 2dp: both operands are
    vat_r = _round(net_r * _d(body.vat_rate))
    total_r = net_r + vat_r                  # net + vat = total to the penny

    return {
        "subtotal": float(subtotal_r),
        "discount": float(discount_r),
        "net": float(net_r),
        "vat": float(vat_r),
        "total": float(total_r),
    }
