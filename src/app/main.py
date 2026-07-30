import math
from decimal import ROUND_HALF_UP, Decimal

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator

from . import __version__
from .models import ItemCreate, ItemView, ReservationCreate, ReservationView
from .store import Conflict, InventoryStore, NotFound


# ---------------------------------------------------------------------------
# Invoice line models (legacy)
# ---------------------------------------------------------------------------


class InvoiceLineRequest(BaseModel):
    unit_price: float = Field(gt=0, description="Price per unit (must be positive)")
    quantity: int = Field(ge=1, description="Number of units (at least 1)")
    description: str | None = None


class InvoiceLineResponse(BaseModel):
    unit_price: float
    quantity: int
    description: str | None
    total: float


# ---------------------------------------------------------------------------
# /api/line-total models
# ---------------------------------------------------------------------------


class LineTotalRequest(BaseModel):
    """Request body for POST /api/line-total."""

    unit_price: float = Field(
        gt=0,
        le=1_000_000,
        description="Price per unit in GBP (positive, max 1,000,000)",
    )
    quantity: int = Field(
        ge=1,
        le=10_000,
        description="Number of units (1 to 10,000 inclusive)",
    )
    vat_rate: float = Field(
        ge=0.0,
        le=1.0,
        description="VAT rate as a fraction of net (0 to 1 inclusive)",
    )

    @field_validator("unit_price", "vat_rate", mode="before")
    @classmethod
    def _reject_non_finite(cls, v: object) -> object:
        """Reject NaN and infinity before Pydantic's own coercion runs."""
        try:
            fv = float(v)  # type: ignore[arg-type]
        except (TypeError, ValueError):
            raise ValueError("must be a number")
        if not math.isfinite(fv):
            raise ValueError("must be a finite number (NaN and Infinity are not allowed)")
        return v


class LineTotalResponse(BaseModel):
    """Response body for POST /api/line-total."""

    net: float
    vat: float
    total: float


def _half_up(value: Decimal) -> Decimal:
    """Round *value* to 2 decimal places using half-up (ties away from zero)."""
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


app = FastAPI(title="aifactory-demo", version=__version__)

# Single process-wide store instance shared across requests.
store = InventoryStore()


@app.exception_handler(NotFound)
async def _not_found_handler(request: Request, exc: NotFound) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(Conflict)
async def _conflict_handler(request: Request, exc: Conflict) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": str(exc)})


@app.get("/")
async def root() -> dict[str, str]:
    return {"app": "aifactory-demo"}


@app.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/items", response_model=ItemView, status_code=201)
async def create_item(body: ItemCreate) -> dict:
    return store.create_item(body.sku, body.total)


@app.get("/items/{sku}", response_model=ItemView)
async def get_item(sku: str) -> dict:
    return store.get_item(sku)


@app.post("/items/{sku}/reservations", status_code=201)
async def create_reservation(sku: str, body: ReservationCreate) -> dict:
    rid = store.reserve(sku, body.quantity, body.ttl_seconds)
    return store.get_reservation(rid)


@app.get("/reservations/{reservation_id}", response_model=ReservationView)
async def get_reservation(reservation_id: str) -> dict:
    return store.get_reservation(reservation_id)


@app.post("/reservations/{reservation_id}/confirm", response_model=ReservationView)
async def confirm_reservation(reservation_id: str) -> dict:
    return store.confirm(reservation_id)


@app.delete("/reservations/{reservation_id}", response_model=ReservationView)
async def cancel_reservation(reservation_id: str) -> dict:
    return store.cancel(reservation_id)


# ---------------------------------------------------------------------------
# Invoice endpoints (legacy)
# ---------------------------------------------------------------------------


@app.post("/invoices/line-total", response_model=InvoiceLineResponse)
async def invoice_line_total(body: InvoiceLineRequest) -> dict:
    """Return the line total (unit_price × quantity) for a single invoice line."""
    return {
        "unit_price": body.unit_price,
        "quantity": body.quantity,
        "description": body.description,
        "total": round(body.unit_price * body.quantity, 2),
    }


# ---------------------------------------------------------------------------
# /api/line-total — stateless VAT calculator (AC1-AC6)
# ---------------------------------------------------------------------------


@app.post("/api/line-total", response_model=LineTotalResponse)
async def api_line_total(body: LineTotalRequest) -> dict:
    """Compute net, VAT and gross total for one invoice line.

    Arithmetic (AC2):
      net   = half-up round(unit_price × quantity, 2)
      vat   = half-up round(net × vat_rate, 2)
      total = net + vat          (exact; never rounded again)

    The handler is intentionally stateless — no DB, file, or secret access (AC6).
    """
    unit_price = Decimal(str(body.unit_price))
    quantity = Decimal(str(body.quantity))
    vat_rate = Decimal(str(body.vat_rate))

    net = _half_up(unit_price * quantity)
    vat = _half_up(net * vat_rate)
    total = net + vat  # exact; net and vat are already rounded to 2 dp

    return {"net": float(net), "vat": float(vat), "total": float(total)}
