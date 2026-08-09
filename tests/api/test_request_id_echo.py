"""Functional (HTTP) verification for RequestIDMiddleware.

AC#1: When a client sends X-Request-ID, the response echoes that exact value.

Target: src/app/request_id.py::RequestIDMiddleware

These tests drive a real running instance of the SUT over HTTP (api lane).
The base URL is read from TFACTORY_TARGET_URL at test time.
"""

import os
import uuid

import pytest
import requests


@pytest.mark.parametrize(
    "request_id",
    [
        "client-supplied-correlation-token",
        "abc123",
        str(uuid.UUID("12345678-1234-4234-8234-1234567890ab")),
        "a" * 200,
    ],
    ids=[
        "plain-token",
        "short-alnum",
        "uuid-shaped",
        "max-length-200",
    ],
)
def test_request_id_supplied_is_echoed_exactly(request_id):
    """AC#1: the response echoes the exact X-Request-ID the client supplied."""
    base_url = os.environ["TFACTORY_TARGET_URL"]

    resp = requests.get(
        f"{base_url}/healthz",
        headers={"X-Request-ID": request_id},
        timeout=10,
    )

    assert resp.status_code == 200
    assert resp.headers.get("X-Request-ID") == request_id
