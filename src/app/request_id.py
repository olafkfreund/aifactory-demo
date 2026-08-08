"""X-Request-ID correlation middleware.

Reads the ``X-Request-ID`` header from every incoming request and echoes
the value back in the response header of the same name.  This lets
callers correlate a specific HTTP exchange with log lines that were
emitted while handling it.

Usage (in main.py)::

    from .request_id import RequestIDMiddleware
    app.add_middleware(RequestIDMiddleware)
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Echo an incoming ``X-Request-ID`` header back on every response.

    If the client supplies an ``X-Request-ID`` request header the
    middleware copies its value verbatim into the ``X-Request-ID``
    response header so the caller can match the response to the request
    they made.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("X-Request-ID")
        response = await call_next(request)
        if request_id is not None:
            response.headers["X-Request-ID"] = request_id
        return response
