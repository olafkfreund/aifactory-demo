"""Deployable entrypoint for the aifactory-demo service.

Booted in production via ``uvicorn src.app.main:app``. This module wires the
request-audit trail into the real application: the :class:`AuditMiddleware`
records one record per handled request (AC1, self-excluding ``/api/audit`` per
AC4), and the ``/api/audit`` query router (AC3) is served under client-key auth
(AC6). Both the middleware and the query endpoint are bound to a single shared
:class:`SQLiteAuditStore` so writes and reads hit the same data (AC2).

Operational configuration (environment variables):

- ``AUDIT_CLIENT_KEYS`` — comma-separated allowlist of valid client keys for
  ``GET /api/audit``. Fail-closed: if unset/empty, every request is rejected
  with ``403`` (no keys are valid), so audit data is never exposed by default.
- ``AUDIT_DB_PATH`` — filesystem path for the SQLite audit database
  (default ``data/audit.db``), giving persistence across restarts (AC2).
"""

from __future__ import annotations

from fastapi import FastAPI

from . import __version__
from .audit.api import router as audit_router, set_audit_store
from .audit.middleware import AuditMiddleware
from .audit.store import SQLiteAuditStore

app = FastAPI(title="aifactory-demo", version=__version__)

# Bind ONE store so the middleware writes and the query endpoint read the same
# data (AC2). The path honours AUDIT_DB_PATH; auth honours AUDIT_CLIENT_KEYS.
set_audit_store(SQLiteAuditStore())

# Record every handled request (AC1); the middleware self-excludes /api/audit
# (AC4) and resolves the shared store via api.get_audit_store by default.
app.add_middleware(AuditMiddleware)

# Expose GET /api/audit with client-key auth (AC3, AC6).
app.include_router(audit_router)


@app.get("/")
async def root() -> dict[str, str]:
    return {"app": "aifactory-demo"}


@app.get("/health")
async def health() -> dict[str, str]:
    """Liveness/readiness probe used by the deploy readiness gate."""
    return {"status": "ok"}
