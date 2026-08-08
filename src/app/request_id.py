"""X-Request-ID correlation middleware.

Reads the ``X-Request-ID`` header from every incoming request and echoes
the value back in the response header of the same name.  When the client
does not supply the header the middleware generates a UUID4 and returns
that instead.  This lets callers correlate a specific HTTP exchange with
log lines that were emitted while handling it.

Validation rules applied to client-supplied IDs
------------------------------------------------
* Maximum length: 200 characters — longer values are rejected with HTTP 400
  so the header cannot inject unbounded data into the logs.

Logging (AC#3)
--------------
After each request completes the middleware emits one ``INFO`` log line via
the ``app.request_id`` logger.  The log record carries these extra fields on
its ``LogRecord`` so structured handlers (JSON, ECS, …) can forward them::

    request_id  – the correlation token used for this exchange
    method      – HTTP verb (GET, POST, …)
    path        – URL path (e.g. ``/healthz``)
    status_code – integer HTTP status returned to the client

Usage (in main.py)::

    from .request_id import RequestIDMiddleware
    app.add_middleware(RequestIDMiddleware)
"""

import logging
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

_MAX_REQUEST_ID_LENGTH = 200
_INJECTION_CHARS = frozenset("\r\n")

logger = logging.getLogger("app.request_id")


def _contains_injection_chars(value: str) -> bool:
    """Return ``True`` if *value* contains a carriage-return or line-feed.

    Such characters can be used to forge extra lines in log output (log
    injection), so any X-Request-ID that contains them must be rejected
    before it is written to any log sink (AC#5).
    """
    return not _INJECTION_CHARS.isdisjoint(value)


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Attach an ``X-Request-ID`` header to every response and emit a log line.

    If the client supplies an ``X-Request-ID`` request header the
    middleware validates and then copies its value verbatim into the
    ``X-Request-ID`` response header so the caller can match the response
    to the request they made.

    Validation:
    - A value longer than 200 characters is rejected with HTTP 400 to
      prevent unbounded data from being injected into the logs (AC#4).

    If the client supplies no ``X-Request-ID`` header the middleware
    generates a UUID4 and returns it in the ``X-Request-ID`` response
    header so the caller still has a correlation token.

    Logging (AC#3):
    After the response is produced the middleware logs one INFO record
    through the ``app.request_id`` logger.  The record's message contains
    the correlation token, verb, path, and status code, and the same values
    are attached as extra fields for structured log handlers.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        raw_id = request.headers.get("X-Request-ID")
        if raw_id is not None:
            if len(raw_id) > _MAX_REQUEST_ID_LENGTH:
                return JSONResponse(
                    status_code=400,
                    content={
                        "detail": (
                            "X-Request-ID must not exceed"
                            f" {_MAX_REQUEST_ID_LENGTH} characters"
                        )
                    },
                )
            if _contains_injection_chars(raw_id):
                return JSONResponse(
                    status_code=400,
                    content={
                        "detail": (
                            "X-Request-ID must not contain"
                            " CR or LF characters"
                        )
                    },
                )
            request_id = raw_id
        else:
            request_id = str(uuid.uuid4())
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        logger.info(
            "%s %s %s %d",
            request_id,
            request.method,
            request.url.path,
            response.status_code,
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
            },
        )
        return response
