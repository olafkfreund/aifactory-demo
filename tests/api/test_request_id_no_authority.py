"""API-lane tests for the X-Request-ID no-authority guarantee (AC#6).

AC#6: The correlation header requires no authentication and grants no
      authority: it is echoed for observability only, is never used for
      authorization decisions, and never appears in an audit record as an
      identity.

Target: src/app/request_id.py::RequestIDMiddleware

These tests drive a running instance of the SUT over real HTTP (base URL
from TFACTORY_TARGET_URL) and prove that:
- X-Request-ID is accepted without any authentication credentials.
- Supplying (or crafting) an X-Request-ID grants no elevated access.
- The correlation value is echoed only in the response header, never
  surfaced in the response body as an identity.
"""

import os
import uuid

import pytest
import requests

TIMEOUT = 10


# ---------------------------------------------------------------------------
# AC#6 — no authentication required to send the header
# ---------------------------------------------------------------------------


def test_request_id_accepted_without_auth_header_returns_200():
    """X-Request-ID is accepted from a client that sends no auth credentials."""
    base_url = os.environ["TFACTORY_TARGET_URL"]
    request_id = f"unauthenticated-{uuid.uuid4()}"
    resp = requests.get(
        f"{base_url}/", headers={"X-Request-ID": request_id}, timeout=TIMEOUT
    )
    assert resp.status_code == 200
    assert resp.headers["X-Request-ID"] == request_id


def test_request_id_echoed_without_auth_on_healthz():
    """The echo works even when no Authorization header is supplied."""
    base_url = os.environ["TFACTORY_TARGET_URL"]
    request_id = "no-auth-echo-check"
    resp = requests.get(
        f"{base_url}/healthz",
        headers={"X-Request-ID": request_id},
        timeout=TIMEOUT,
    )
    assert resp.status_code == 200
    assert resp.headers["X-Request-ID"] == request_id


# ---------------------------------------------------------------------------
# AC#6 — correlation header grants no elevated authority
# ---------------------------------------------------------------------------


def test_request_id_does_not_unlock_missing_item_returns_404():
    """Supplying X-Request-ID does not grant access to a non-existent item."""
    base_url = os.environ["TFACTORY_TARGET_URL"]
    resp = requests.get(
        f"{base_url}/items/nonexistent-sku-99999",
        headers={"X-Request-ID": str(uuid.uuid4())},
        timeout=TIMEOUT,
    )
    assert resp.status_code == 404


def test_response_body_identical_with_and_without_request_id():
    """The X-Request-ID header has no effect on the response body."""
    base_url = os.environ["TFACTORY_TARGET_URL"]
    resp_without = requests.get(f"{base_url}/", timeout=TIMEOUT)
    resp_with = requests.get(
        f"{base_url}/",
        headers={"X-Request-ID": "some-correlation-id"},
        timeout=TIMEOUT,
    )
    assert resp_without.status_code == resp_with.status_code
    assert resp_without.json() == resp_with.json()


@pytest.mark.parametrize(
    "suspicious_id",
    [
        "admin",
        "root",
        "superuser",
        "Bearer admin-token",
        "Authorization: Bearer fake",
        "../etc/passwd",
    ],
    ids=[
        "admin",
        "root",
        "superuser",
        "bearer-token",
        "auth-header-string",
        "path-traversal",
    ],
)
def test_suspicious_request_id_grants_no_access_returns_404(suspicious_id: str):
    """A specially-crafted X-Request-ID value grants no elevated access."""
    base_url = os.environ["TFACTORY_TARGET_URL"]
    resp = requests.get(
        f"{base_url}/items/nonexistent-sku-for-auth-check",
        headers={"X-Request-ID": suspicious_id},
        timeout=TIMEOUT,
    )
    assert resp.status_code == 404, (
        f"Suspicious ID {suspicious_id!r} unexpectedly changed the status code"
    )


# ---------------------------------------------------------------------------
# AC#6 — correlation value is observability-only (header, never body identity)
# ---------------------------------------------------------------------------


def test_correlation_id_in_header_not_body_on_success():
    """On a 200 response the correlation ID is in the header, not the body."""
    base_url = os.environ["TFACTORY_TARGET_URL"]
    request_id = f"observability-only-{uuid.uuid4()}"
    resp = requests.get(
        f"{base_url}/", headers={"X-Request-ID": request_id}, timeout=TIMEOUT
    )
    assert resp.status_code == 200
    assert resp.headers["X-Request-ID"] == request_id
    assert request_id not in resp.text


def test_correlation_id_not_in_error_body_for_missing_item():
    """The correlation ID does not appear inside the 404 error body."""
    base_url = os.environ["TFACTORY_TARGET_URL"]
    request_id = f"my-unique-observer-{uuid.uuid4()}"
    resp = requests.get(
        f"{base_url}/items/nonexistent-sku",
        headers={"X-Request-ID": request_id},
        timeout=TIMEOUT,
    )
    assert resp.status_code == 404
    assert request_id not in resp.text
