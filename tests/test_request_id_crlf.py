"""Tests for X-Request-ID CR/LF log-injection guard (AC#5).

AC#5: A client-supplied id containing CR or LF is rejected with HTTP 400,
      so the header cannot forge additional log lines.

Since HTTP transport layers (h11) also reject malformed headers, the guard
is verified at two levels:

1. **Unit tests** of the ``_contains_injection_chars`` validation helper
   imported directly from ``app.request_id``.

2. **ASGI-level integration tests** that bypass HTTP transport entirely and
   invoke the FastAPI ASGI app with raw CR/LF-containing header bytes,
   proving that the middleware itself enforces the check.
"""

import asyncio
import json
import logging

from app.main import app as asgi_app
from app.request_id import _contains_injection_chars

# ---------------------------------------------------------------------------
# Unit tests — _contains_injection_chars helper (AC#5)
# ---------------------------------------------------------------------------


def test_clean_id_not_flagged():
    """A normal ASCII request ID contains no injection characters."""
    assert _contains_injection_chars("normal-request-id-abc123") is False


def test_lf_detected():
    """A value with a linefeed (LF, \\n) is flagged as unsafe."""
    assert _contains_injection_chars("foo\nbar") is True


def test_cr_detected():
    """A value with a carriage-return (CR, \\r) is flagged as unsafe."""
    assert _contains_injection_chars("foo\rbar") is True


def test_crlf_sequence_detected():
    """A value with a CRLF sequence (\\r\\n) is flagged as unsafe."""
    assert _contains_injection_chars("foo\r\nbar") is True


def test_leading_lf_detected():
    """A value starting with LF is flagged."""
    assert _contains_injection_chars("\nfoo") is True


def test_trailing_lf_detected():
    """A value ending with LF is flagged."""
    assert _contains_injection_chars("foo\n") is True


def test_only_cr_is_flagged():
    """A value that is solely a CR character is flagged."""
    assert _contains_injection_chars("\r") is True


def test_only_lf_is_flagged():
    """A value that is solely a LF character is flagged."""
    assert _contains_injection_chars("\n") is True


def test_empty_string_not_flagged():
    """An empty string does not contain injection characters."""
    assert _contains_injection_chars("") is False


def test_uuid_not_flagged():
    """A UUID4-formatted string contains no injection characters."""
    assert _contains_injection_chars("550e8400-e29b-41d4-a716-446655440000") is False


def test_alphanumeric_not_flagged():
    """Alphanumeric values with hyphens and underscores are clean."""
    assert _contains_injection_chars("req-2024-08-08_001") is False


# ---------------------------------------------------------------------------
# Helpers — minimal ASGI caller (bypasses h11 / httpx header validation)
# ---------------------------------------------------------------------------


async def _asgi_get(extra_headers: list[tuple[bytes, bytes]]) -> dict:
    """Call the ASGI app for GET / with *extra_headers* injected directly.

    This bypasses h11's HTTP parsing so we can pass raw CR/LF bytes in
    header values and confirm the middleware itself enforces the guard.
    """
    base_headers: list[tuple[bytes, bytes]] = [
        (b"host", b"testserver"),
        (b"user-agent", b"test-asgi-caller"),
    ]
    scope = {
        "type": "http",
        "asgi": {"version": "3.0"},
        "http_version": "1.1",
        "method": "GET",
        "path": "/",
        "query_string": b"",
        "root_path": "",
        "headers": base_headers + extra_headers,
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


def _asgi_get_sync(extra_headers: list[tuple[bytes, bytes]]) -> dict:
    """Synchronous wrapper for ``_asgi_get`` suitable for use in pytest."""
    return asyncio.run(_asgi_get(extra_headers))


# ---------------------------------------------------------------------------
# ASGI-level integration tests — middleware rejects CR/LF (AC#5)
# ---------------------------------------------------------------------------


def test_lf_in_request_id_rejected_via_asgi():
    """Middleware returns 400 when X-Request-ID contains LF."""
    result = _asgi_get_sync([(b"x-request-id", b"foo\nbar")])
    assert result["status"] == 400


def test_cr_in_request_id_rejected_via_asgi():
    """Middleware returns 400 when X-Request-ID contains CR."""
    result = _asgi_get_sync([(b"x-request-id", b"foo\rbar")])
    assert result["status"] == 400


def test_crlf_in_request_id_rejected_via_asgi():
    """Middleware returns 400 when X-Request-ID contains CRLF sequence."""
    result = _asgi_get_sync([(b"x-request-id", b"foo\r\nbar")])
    assert result["status"] == 400


def test_only_lf_in_request_id_rejected_via_asgi():
    """Middleware returns 400 for a bare LF character as the entire header value."""
    result = _asgi_get_sync([(b"x-request-id", b"\n")])
    assert result["status"] == 400


def test_only_cr_in_request_id_rejected_via_asgi():
    """Middleware returns 400 for a bare CR character as the entire header value."""
    result = _asgi_get_sync([(b"x-request-id", b"\r")])
    assert result["status"] == 400


def test_crlf_rejection_returns_json_detail():
    """The 400 for a CR/LF-containing ID includes a JSON 'detail' field."""
    result = _asgi_get_sync([(b"x-request-id", b"inject\nX-Fake-Header: evil")])
    assert result["status"] == 400
    assert "detail" in result["body"]


def test_valid_id_accepted_via_asgi():
    """A clean request ID passes through the middleware without rejection."""
    result = _asgi_get_sync([(b"x-request-id", b"valid-request-id-123")])
    assert result["status"] == 200


def test_crlf_id_produces_no_log_record():
    """A rejected CR/LF ID produces no log record (middleware short-circuits)."""

    class _Counter(logging.Handler):
        count: int = 0

        def emit(self, record: logging.LogRecord) -> None:
            self.count += 1

    counter = _Counter()
    _logger = logging.getLogger("app.request_id")
    _logger.addHandler(counter)
    try:
        _asgi_get_sync([(b"x-request-id", b"log\ninjection\nattempt")])
        assert counter.count == 0, (
            "Middleware must not log anything for an injected X-Request-ID"
        )
    finally:
        _logger.removeHandler(counter)


def test_lf_at_start_of_id_rejected():
    """A request ID beginning with LF is rejected."""
    result = _asgi_get_sync([(b"x-request-id", b"\nleading-lf")])
    assert result["status"] == 400


def test_lf_at_end_of_id_rejected():
    """A request ID ending with LF is rejected."""
    result = _asgi_get_sync([(b"x-request-id", b"trailing-lf\n")])
    assert result["status"] == 400
