"""ASGI middleware that records one audit record per handled request.

For every request the application handles this middleware writes exactly one
:class:`~app.audit.models.AuditRecord` capturing the HTTP method, request path,
response status code, handling latency in milliseconds and the calling client
key (AC1).

To prevent *self-amplification*, requests targeting the audit query endpoint
itself (``/api/audit``) are never recorded (AC4). Without this exclusion,
querying the trail would append a new record on every read, so the store would
grow on each call and pollute its own results.

The middleware is self-contained: it does not wire itself into the application.
Add it with ``app.add_middleware(AuditMiddleware)`` (optionally passing a
``store_factory``); by default it resolves the process-wide store via
:func:`app.audit.api.get_audit_store`.
"""

from __future__ import annotations

import logging
import time
from collections.abc import Callable

from starlette.concurrency import run_in_threadpool
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp

from .api import get_audit_store
from .models import AuditRecord
from .store import AuditStore

logger = logging.getLogger(__name__)

# Path prefix of the audit query endpoint, excluded from recording (AC4).
AUDIT_PATH_PREFIX = "/api/audit"
# Request header carrying the caller's client key, when present.
CLIENT_KEY_HEADER = "x-client-key"


def is_excluded_path(path: str, prefix: str = AUDIT_PATH_PREFIX) -> bool:
    """Return ``True`` when *path* targets the audit endpoint and must be skipped.

    The audit query endpoint is excluded to avoid self-amplification (AC4):
    reading the trail would otherwise append a new record on every call.

    Matching is exact on *prefix* or on any sub-path beneath it, so unrelated
    paths that merely share the textual prefix (for example ``/api/auditors``)
    are still recorded. A trailing slash on *path* is ignored.
    """
    normalised = path.rstrip("/") or "/"
    return normalised == prefix or normalised.startswith(prefix + "/")


class AuditMiddleware(BaseHTTPMiddleware):
    """Record an :class:`AuditRecord` for each handled request.

    Args:
        app: The wrapped ASGI application.
        store_factory: Callable returning the :class:`AuditStore` to append to.
            Defaults to :func:`app.audit.api.get_audit_store` so the middleware
            shares the same store as the query endpoint.
        excluded_prefix: Path prefix of the self-excluded audit endpoint (AC4).
        client_key_header: Name of the header carrying the client key.
    """

    def __init__(
        self,
        app: ASGIApp,
        *,
        store_factory: Callable[[], AuditStore] = get_audit_store,
        excluded_prefix: str = AUDIT_PATH_PREFIX,
        client_key_header: str = CLIENT_KEY_HEADER,
    ) -> None:
        super().__init__(app)
        self._store_factory = store_factory
        self._excluded_prefix = excluded_prefix
        self._client_key_header = client_key_header

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        start = time.perf_counter()
        response = await call_next(request)

        # Self-exclusion (AC4): never record calls to the audit endpoint.
        if is_excluded_path(request.url.path, self._excluded_prefix):
            return response

        latency_ms = (time.perf_counter() - start) * 1000.0
        record = AuditRecord(
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            latency_ms=latency_ms,
            client_key=request.headers.get(self._client_key_header),
        )
        try:
            store = self._store_factory()
            # The store is synchronous (SQLite); run it off the event loop.
            await run_in_threadpool(store.append, record)
        except Exception:  # pragma: no cover - defensive: auditing is best-effort
            # Auditing must never break the request it observes.
            logger.exception("Failed to record audit entry for %s", request.url.path)

        return response
