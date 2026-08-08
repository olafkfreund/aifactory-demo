"""Tests for X-Request-ID structured logging (AC#3).

AC#3: After each request the middleware emits one INFO log record via the
      ``app.request_id`` logger that contains the correlation token, HTTP
      method, path, and status code so log lines can be matched to the
      specific HTTP exchange that produced them.
"""

import logging
import re
import uuid

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

_LOGGER_NAME = "app.request_id"
_UUID4_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


class _CapturingHandler(logging.Handler):
    """Collect all LogRecords emitted to a logger during a test."""

    def __init__(self):
        super().__init__()
        self.records: list[logging.LogRecord] = []

    def emit(self, record: logging.LogRecord) -> None:
        self.records.append(record)


@pytest.fixture()
def log_capture():
    """Yield a handler attached to the middleware logger; clean up after."""
    handler = _CapturingHandler()
    handler.setLevel(logging.DEBUG)
    _logger = logging.getLogger(_LOGGER_NAME)
    _logger.addHandler(handler)
    _logger.setLevel(logging.DEBUG)
    try:
        yield handler
    finally:
        _logger.removeHandler(handler)


# ---------------------------------------------------------------------------
# AC#3 — structured log emission
# ---------------------------------------------------------------------------


def test_log_record_emitted_on_get(log_capture):
    """A GET / request produces exactly one log record from the middleware."""
    client.get("/")
    assert len(log_capture.records) == 1


def test_log_record_emitted_on_healthz(log_capture):
    """A GET /healthz request also produces one log record."""
    client.get("/healthz")
    assert len(log_capture.records) == 1


def test_log_record_level_is_info(log_capture):
    """The log record is emitted at INFO level."""
    client.get("/")
    record = log_capture.records[0]
    assert record.levelno == logging.INFO


def test_log_record_logger_name(log_capture):
    """The record comes from the ``app.request_id`` logger."""
    client.get("/")
    record = log_capture.records[0]
    assert record.name == _LOGGER_NAME


def test_log_record_contains_request_id_extra_field(log_capture):
    """The LogRecord exposes ``request_id`` as an extra attribute."""
    supplied_id = "log-test-id-001"
    client.get("/", headers={"X-Request-ID": supplied_id})
    record = log_capture.records[0]
    assert hasattr(record, "request_id"), "LogRecord missing 'request_id' attribute"
    assert record.request_id == supplied_id


def test_log_record_contains_method_extra_field(log_capture):
    """The LogRecord exposes ``method`` as an extra attribute."""
    client.get("/healthz")
    record = log_capture.records[0]
    assert hasattr(record, "method"), "LogRecord missing 'method' attribute"
    assert record.method == "GET"


def test_log_record_contains_path_extra_field(log_capture):
    """The LogRecord exposes ``path`` as an extra attribute."""
    client.get("/healthz")
    record = log_capture.records[0]
    assert hasattr(record, "path"), "LogRecord missing 'path' attribute"
    assert record.path == "/healthz"


def test_log_record_contains_status_code_extra_field(log_capture):
    """The LogRecord exposes ``status_code`` as an extra attribute."""
    client.get("/")
    record = log_capture.records[0]
    assert hasattr(record, "status_code"), "LogRecord missing 'status_code' attribute"
    assert record.status_code == 200


def test_log_record_echoes_client_request_id(log_capture):
    """When the client supplies an X-Request-ID it appears in the log record."""
    supplied_id = "trace-abc-123"
    client.get("/", headers={"X-Request-ID": supplied_id})
    record = log_capture.records[0]
    assert record.request_id == supplied_id


def test_log_record_auto_generated_id_is_uuid4(log_capture):
    """When no X-Request-ID is supplied the logged ID is a valid UUID4."""
    client.get("/")
    record = log_capture.records[0]
    assert _UUID4_RE.match(record.request_id), (
        f"Expected UUID4 in log record, got {record.request_id!r}"
    )


def test_log_record_message_contains_request_id(log_capture):
    """The formatted log message includes the correlation token."""
    supplied_id = "msg-check-id"
    client.get("/", headers={"X-Request-ID": supplied_id})
    record = log_capture.records[0]
    assert supplied_id in record.getMessage()


def test_log_record_message_contains_method(log_capture):
    """The formatted log message includes the HTTP method."""
    client.get("/healthz")
    record = log_capture.records[0]
    assert "GET" in record.getMessage()


def test_log_record_message_contains_path(log_capture):
    """The formatted log message includes the URL path."""
    client.get("/healthz")
    record = log_capture.records[0]
    assert "/healthz" in record.getMessage()


def test_log_record_message_contains_status_code(log_capture):
    """The formatted log message includes the HTTP status code."""
    client.get("/")
    record = log_capture.records[0]
    assert "200" in record.getMessage()


def test_log_record_post_request(log_capture):
    """POST requests are also logged with the correct method and path."""
    client.post("/items", json={"sku": "sku-log-test", "total": 3})
    assert len(log_capture.records) == 1
    record = log_capture.records[0]
    assert record.method == "POST"
    assert record.path == "/items"
    assert record.status_code == 201


def test_oversized_request_id_no_log_emitted(log_capture):
    """A rejected (400) oversized X-Request-ID produces no log record.

    The middleware short-circuits before calling the next handler so no
    downstream processing — and no log emission — should occur.
    """
    oversized_id = "x" * 201
    resp = client.get("/", headers={"X-Request-ID": oversized_id})
    assert resp.status_code == 400
    assert len(log_capture.records) == 0


def test_each_request_emits_one_record(log_capture):
    """Three consecutive requests each produce exactly one log record."""
    client.get("/")
    client.get("/healthz")
    client.get("/")
    assert len(log_capture.records) == 3


def test_log_records_have_distinct_request_ids(log_capture):
    """Two requests without X-Request-ID produce records with different IDs."""
    client.get("/")
    client.get("/")
    ids = [r.request_id for r in log_capture.records]
    assert ids[0] != ids[1], "Both auto-generated request IDs should be unique"


def test_log_record_auto_id_matches_response_header(log_capture):
    """The request_id in the log record matches the X-Request-ID response header."""
    resp = client.get("/")
    record = log_capture.records[0]
    assert record.request_id == resp.headers["X-Request-ID"]


def test_log_record_supplied_id_matches_response_header(log_capture):
    """When the client supplies an ID the log record and response header agree."""
    supplied_id = str(uuid.uuid4())
    resp = client.get("/", headers={"X-Request-ID": supplied_id})
    record = log_capture.records[0]
    assert record.request_id == resp.headers["X-Request-ID"] == supplied_id
