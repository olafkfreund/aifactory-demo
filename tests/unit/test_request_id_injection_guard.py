"""CR/LF log-injection guard, verified at the middleware dispatch entry point.

AC#5: A client-supplied id containing CR or LF is rejected with HTTP 400, so
      the header cannot forge additional log lines.

The target is ``RequestIDMiddleware.dispatch``.  HTTP transport layers (h11)
also reject malformed header bytes, so to prove that ``dispatch`` itself
enforces the guard we drive the FastAPI ASGI app directly with a raw scope
whose header value carries CR/LF bytes.  This bypasses HTTP parsing and lets
the injected value reach ``dispatch`` unmodified.
"""

import asyncio
import json

import pytest

from app.main import app as asgi_app


async def _asgi_get(header_value: bytes) -> dict:
    """Invoke the ASGI app for ``GET /`` with a raw ``x-request-id`` value.

    Passing the header as raw bytes (rather than through an HTTP client)
    delivers CR/LF-containing values straight to ``dispatch``.
    """
    scope = {
        "type": "http",
        "asgi": {"version": "3.0"},
        "http_version": "1.1",
        "method": "GET",
        "path": "/",
        "query_string": b"",
        "root_path": "",
        "headers": [
            (b"host", b"testserver"),
            (b"x-request-id", header_value),
        ],
        "server": ("testserver", 80),
        "client": ("127.0.0.1", 12345),
    }

    result: dict = {}
    body_chunks: list[bytes] = []

    async def receive() -> dict:
        return {"type": "http.request", "body": b"", "more_body": False}

    async def send(message: dict) -> None:
        if message["type"] == "http.response.start":
            result["status"] = message["status"]
        elif message["type"] == "http.response.body":
            body_chunks.append(message.get("body", b""))

    await asgi_app(scope, receive, send)
    result["body"] = json.loads(b"".join(body_chunks)) if body_chunks else {}
    return result


@pytest.mark.parametrize(
    "header_value",
    [
        b"foo\nbar",
        b"foo\rbar",
        b"foo\r\nbar",
        b"\n",
        b"\r",
        b"\nleading",
        b"trailing\n",
        b"inject\nX-Fake-Header: evil",
    ],
    ids=[
        "embedded-lf",
        "embedded-cr",
        "embedded-crlf",
        "bare-lf",
        "bare-cr",
        "leading-lf",
        "trailing-lf",
        "forged-header",
    ],
)
def test_crlf_request_id_rejected_with_400(header_value):
    """dispatch rejects any CR/LF-bearing X-Request-ID with HTTP 400."""
    result = asyncio.run(_asgi_get(header_value))
    assert result["status"] == 400


def test_crlf_rejection_response_carries_json_detail():
    """The 400 emitted by dispatch for a CR/LF id includes a 'detail' field."""
    result = asyncio.run(_asgi_get(b"log\ninjection\nattempt"))
    assert result["status"] == 400
    assert "detail" in result["body"]


def test_clean_request_id_passes_through_dispatch():
    """A CR/LF-free X-Request-ID is not rejected; dispatch returns 200."""
    result = asyncio.run(_asgi_get(b"clean-request-id-123"))
    assert result["status"] == 200
