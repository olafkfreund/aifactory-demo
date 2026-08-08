from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from . import __version__
from .link_store import LinkNotFound
from .links_router import links_router
from .models import ItemCreate, ItemView, ReservationCreate, ReservationView
from .request_id import RequestIDMiddleware
from .store import Conflict, InventoryStore, NotFound

app = FastAPI(title="aifactory-demo", version=__version__)

# X-Request-ID correlation: echo the client-supplied header on every response.
app.add_middleware(RequestIDMiddleware)

# Single process-wide store instance shared across requests.
store = InventoryStore()

# Link shortener router.
app.include_router(links_router)


@app.exception_handler(NotFound)
async def _not_found_handler(request: Request, exc: NotFound) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(Conflict)
async def _conflict_handler(request: Request, exc: Conflict) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": str(exc)})


@app.exception_handler(LinkNotFound)
async def _link_not_found_handler(request: Request, exc: LinkNotFound) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": str(exc)})


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
