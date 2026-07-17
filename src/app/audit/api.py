"""HTTP query API for the request-audit trail.

Exposes ``GET /api/audit`` which returns stored audit records, newest first,
with support for filtering by path prefix, HTTP status class (``2xx``/``4xx``/
``5xx``) and an inclusive ``from``/``to`` timestamp range, plus ``limit``/
``offset`` pagination (AC3).

Access is guarded by the service's client-key authentication (AC6): every
request must present a valid ``X-Client-Key`` header via the
:func:`~app.audit.auth.require_client_key` dependency, or it is rejected with
``401``/``403`` and no audit records are returned.

The router is intentionally self-contained: it does not wire itself into the
application. Call :func:`set_audit_store` (or override :func:`get_audit_store`
via FastAPI dependency overrides in tests) to supply the backing store, then
include :data:`router` on the app.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from .auth import require_client_key
from .models import StatusClass
from .store import AuditStore, SQLiteAuditStore

# Maximum page size accepted by the endpoint; mirrors the store's own clamp.
MAX_LIMIT = 1000
DEFAULT_LIMIT = 100

_store: AuditStore | None = None


def set_audit_store(store: AuditStore | None) -> None:
    """Set the process-wide audit store used by the query endpoint.

    Passing ``None`` clears the cached store so the next request lazily
    constructs a default :class:`SQLiteAuditStore`.
    """
    global _store
    _store = store


def get_audit_store() -> AuditStore:
    """Return the audit store, lazily creating a default one on first use.

    Exposed as a FastAPI dependency so tests can override it with an isolated
    (e.g. in-memory) store via ``app.dependency_overrides``.
    """
    global _store
    if _store is None:
        _store = SQLiteAuditStore()
    return _store


router = APIRouter(prefix="/api", tags=["audit"])


@router.get("/audit", dependencies=[Depends(require_client_key)])
async def query_audit(
    path_prefix: str | None = Query(
        default=None,
        description="Return only records whose path starts with this prefix.",
    ),
    status_class: StatusClass | None = Query(
        default=None,
        description="Filter by HTTP status class: 2xx, 4xx or 5xx.",
    ),
    time_from: str | None = Query(
        default=None,
        alias="from",
        description="Inclusive lower bound for the record timestamp (ISO-8601).",
    ),
    time_to: str | None = Query(
        default=None,
        alias="to",
        description="Inclusive upper bound for the record timestamp (ISO-8601).",
    ),
    limit: int = Query(
        default=DEFAULT_LIMIT,
        ge=0,
        le=MAX_LIMIT,
        description="Maximum number of records to return.",
    ),
    offset: int = Query(
        default=0,
        ge=0,
        description="Number of matching records to skip before returning.",
    ),
    store: AuditStore = Depends(get_audit_store),
) -> dict:
    """Return audit records matching the supplied filters, newest first."""
    records = store.query(
        path_prefix=path_prefix,
        status_class=status_class,
        time_from=time_from,
        time_to=time_to,
        limit=limit,
        offset=offset,
    )
    return {
        "items": [record.to_dict() for record in records],
        "count": len(records),
        "limit": limit,
        "offset": offset,
    }
