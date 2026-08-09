"""API (functional/HTTP) tests for the X-Request-ID length guard.

AC#4: A client-supplied id longer than 200 characters is rejected with
      HTTP 400 rather than echoed, so the header cannot inject unbounded
      data into the logs.

Lane: api — these drive the running SUT over real HTTP via ``requests``
against ``TFACTORY_TARGET_URL``.  Target:
``src/app/request_id.py::RequestIDMiddleware.dispatch``.
"""

import os

import requests

_MAX_LEN = 200


def test_request_id_over_200_chars_is_rejected_with_400():
    """A 201-character X-Request-ID exceeds the 200-char limit -> HTTP 400."""
    base_url = os.environ["TFACTORY_TARGET_URL"]
    request_id = "a" * (_MAX_LEN + 1)
    resp = requests.get(
        f"{base_url}/",
        headers={"X-Request-ID": request_id},
        timeout=10,
    )
    assert resp.status_code == 400


def test_request_id_over_200_chars_is_not_echoed():
    """The oversized id must NOT be echoed back in the response header."""
    base_url = os.environ["TFACTORY_TARGET_URL"]
    request_id = "b" * (_MAX_LEN + 1)
    resp = requests.get(
        f"{base_url}/",
        headers={"X-Request-ID": request_id},
        timeout=10,
    )
    assert resp.status_code == 400
    assert resp.headers.get("X-Request-ID") != request_id


def test_request_id_far_over_200_chars_is_rejected_with_400():
    """A grossly oversized id (1000 chars) is likewise rejected with HTTP 400."""
    base_url = os.environ["TFACTORY_TARGET_URL"]
    request_id = "x" * 1000
    resp = requests.get(
        f"{base_url}/",
        headers={"X-Request-ID": request_id},
        timeout=10,
    )
    assert resp.status_code == 400


def test_request_id_at_200_chars_is_accepted_and_echoed():
    """A 200-character id is exactly at the limit: accepted and echoed verbatim."""
    base_url = os.environ["TFACTORY_TARGET_URL"]
    request_id = "c" * _MAX_LEN
    resp = requests.get(
        f"{base_url}/",
        headers={"X-Request-ID": request_id},
        timeout=10,
    )
    assert resp.status_code == 200
    assert resp.headers["X-Request-ID"] == request_id
