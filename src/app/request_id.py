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

Usage (in main.py)::

    from .request_id import RequestIDMiddleware
    app.add_middleware(RequestIDMiddleware)
"""

import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

_MAX_REQUEST_ID_LENGTH = 200


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Attach an ``X-Request-ID`` header to every response.

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
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        raw_id = request.headers.get("X-Request-ID")
        if raw_id is not None:
            if len(raw_id) > _MAX_REQUEST_ID_LENGTH:
                return JSONResponse(
                    status_code=400,
                    content={
                        "detail": (
                            f"X-Request-ID must not exceed {_MAX_REQUEST_ID_LENGTH} characters"
                        )
                    },
                )
            request_id = raw_id
        else:
            request_id = str(uuid.uuid4())
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response
