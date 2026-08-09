"""Unit tests for X-Request-ID log correlation (AC#3).

AC#3: The resolved request id appears in every log line emitted while
      handling that request.

The RequestIDMiddleware.dispatch method resolves a correlation token
(either the client-supplied X-Request-ID or a generated UUID4) and emits
a log line through the ``app.request_id`` logger while handling the
request.  These tests attach a capturing handler to that logger and assert
that the resolved id is present in the emitted record — both as the
``request_id`` extra field and in the formatted message text — for a
client-supplied id and for an auto-generated one.
"""

import logging
import re

import pytest
from fastapi.testclient import TestClient

from app.main import app

_LOGGER_NAME = "app.request_id"
_UUID4_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
)

client = TestClient(app)


class _CapturingHandler(logging.Handler):
    """Collect every LogRecord emitted to the logger under test."""

    def __init__(self):
        super().__init__()
        self.records: list[logging.LogRecord] = []

    def emit(self, record: logging.LogRecord) -> None:
        self.records.append(record)


@pytest.fixture()
def log_capture():
    """Attach a capturing handler to the ``app.request_id`` logger."""
    handler = _CapturingHandler()
    handler.setLevel(logging.DEBUG)
    logger = logging.getLogger(_LOGGER_NAME)
    logger.addHandler(handler)
    logger.setLevel(logging.DEBUG)
    try:
        yield handler
    finally:
        logger.removeHandler(handler)


def test_supplied_request_id_appears_in_log_record_field(log_capture):
    """A client-supplied X-Request-ID is carried on the emitted log record."""
    supplied_id = "correlation-token-42"
    client.get("/", headers={"X-Request-ID": supplied_id})

    assert len(log_capture.records) == 1
    record = log_capture.records[0]
    assert record.name == _LOGGER_NAME
    assert record.request_id == supplied_id


def test_supplied_request_id_appears_in_log_message(log_capture):
    """The resolved id is present in the formatted log line text."""
    supplied_id = "correlation-token-99"
    client.get("/healthz", headers={"X-Request-ID": supplied_id})

    record = log_capture.records[0]
    assert supplied_id in record.getMessage()


def test_generated_request_id_appears_in_log_record(log_capture):
    """When no header is supplied the generated UUID4 is what gets logged."""
    resp = client.get("/")

    record = log_capture.records[0]
    assert _UUID4_RE.match(record.request_id), (
        f"Expected UUID4 in log record, got {record.request_id!r}"
    )
    # The id in the log line matches the id returned to the client.
    assert record.request_id == resp.headers["X-Request-ID"]
