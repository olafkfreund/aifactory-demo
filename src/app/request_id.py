"""X-Request-ID correlation middleware.

Reads the ``X-Request-ID`` header from every incoming request and echoes
the value back in the response header of the same name.  When the client
does not supply the header the middleware generates a UUID4 and returns
that instead.  This lets callers correlate a specific HTTP exchange with
log lines that were emitted while handling it.

Usage (in main.py)::

    from .request_id import RequestIDMiddleware
    app.add_middleware(RequestIDMiddleware)
"""

import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Attach an ``X-Request-ID`` header to every response.

    If the client supplies an ``X-Request-ID`` request header the
    middleware copies its value verbatim into the ``X-Request-ID``
    response header so the caller can match the response to the request
    they made.

    If the client supplies no ``X-Request-ID`` header the middleware
    generates a UUID4 and returns it in the ``X-Request-ID`` response
    header so the caller still has a correlation token.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response
