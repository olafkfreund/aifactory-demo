"""Tests for X-Request-ID no-authority guarantee (AC#6).

AC#6: The correlation header requires no authentication and grants no
      authority: it is echoed for observability only, is never used for
      authorization decisions, and never appears in an audit record as
      an identity.

These tests verify that:
- X-Request-ID can be sent by any client without credentials.
- Supplying X-Request-ID does not change the outcome of any request.
- Specially-crafted IDs (e.g. "admin", bearer-token strings) grant no
  elevated access.
- The correlation value is never surfaced in response bodies or error
  messages in a way that could be confused with an identity.
"""

import uuid

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

# ---------------------------------------------------------------------------
# AC#6 — no authentication required to send the header
# ---------------------------------------------------------------------------


def test_request_id_accepted_without_any_auth_header():
    """X-Request-ID is accepted from a client that sends no auth credentials."""
    request_id = f"unauthenticated-{uuid.uuid4()}"
    resp = client.get("/", headers={"X-Request-ID": request_id})
    assert resp.status_code == 200
    assert resp.headers["X-Request-ID"] == request_id


def test_root_without_request_id_needs_no_auth():
    """GET / succeeds without X-Request-ID and without any auth header."""
    resp = client.get("/")
    assert resp.status_code == 200


def test_healthz_without_request_id_needs_no_auth():
    """GET /healthz succeeds without X-Request-ID and without any auth header."""
    resp = client.get("/healthz")
    assert resp.status_code == 200


def test_request_id_echoed_regardless_of_auth_absence():
    """The echo works even when no Authorization header is supplied."""
    request_id = "no-auth-echo-check"
    resp = client.get("/healthz", headers={"X-Request-ID": request_id})
    assert resp.status_code == 200
    assert resp.headers["X-Request-ID"] == request_id


# ---------------------------------------------------------------------------
# AC#6 — correlation header grants no elevated authority
# ---------------------------------------------------------------------------


def test_request_id_does_not_unlock_missing_item():
    """Supplying X-Request-ID does not grant access to a non-existent item."""
    resp = client.get(
        "/items/nonexistent-sku-99999",
        headers={"X-Request-ID": str(uuid.uuid4())},
    )
    assert resp.status_code == 404


def test_request_id_does_not_unlock_missing_reservation():
    """Supplying X-Request-ID does not grant access to a non-existent reservation."""
    resp = client.get(
        "/reservations/fake-reservation-id-999",
        headers={"X-Request-ID": str(uuid.uuid4())},
    )
    assert resp.status_code == 404


def test_response_body_identical_with_and_without_request_id():
    """The X-Request-ID header has no effect on the response body."""
    resp_without = client.get("/")
    resp_with = client.get("/", headers={"X-Request-ID": "some-correlation-id"})

    assert resp_without.status_code == resp_with.status_code
    assert resp_without.json() == resp_with.json()


def test_healthz_body_identical_with_and_without_request_id():
    """X-Request-ID does not alter /healthz response body."""
    resp_without = client.get("/healthz")
    resp_with = client.get("/healthz", headers={"X-Request-ID": "healthz-corr-id"})

    assert resp_without.json() == resp_with.json()


# ---------------------------------------------------------------------------
# AC#6 — specially-crafted IDs grant no authority
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "suspicious_id",
    [
        "admin",
        "ADMIN",
        "root",
        "superuser",
        "true",
        "bypass",
        "Bearer admin-token",
        "Authorization: Bearer fake",
        "X-Admin: true",
        "1",
        "null",
        "../etc/passwd",
    ],
)
def test_suspicious_request_id_grants_no_access(suspicious_id: str):
    """A specially-crafted X-Request-ID value grants no elevated access."""
    resp = client.get(
        "/items/nonexistent-sku-for-auth-check",
        headers={"X-Request-ID": suspicious_id},
    )
    # Must not receive 200 (access granted); 404 is the expected outcome.
    assert resp.status_code == 404, (
        f"Suspicious ID {suspicious_id!r} unexpectedly changed the status code"
    )


def test_different_request_ids_produce_same_resource_outcome():
    """Two requests with distinct X-Request-IDs receive the same response."""
    resp_a = client.get("/healthz", headers={"X-Request-ID": "id-alpha"})
    resp_b = client.get("/healthz", headers={"X-Request-ID": "id-beta"})

    assert resp_a.status_code == resp_b.status_code
    assert resp_a.json() == resp_b.json()


def test_many_different_ids_yield_same_body():
    """Cycling through N unique X-Request-IDs all return the same body."""
    bodies = []
    for _ in range(5):
        resp = client.get("/", headers={"X-Request-ID": str(uuid.uuid4())})
        bodies.append(resp.json())

    first = bodies[0]
    assert all(b == first for b in bodies), (
        "Response body varied with X-Request-ID value — header must not affect routing"
    )


# ---------------------------------------------------------------------------
# AC#6 — correlation value never appears in response body as an identity
# ---------------------------------------------------------------------------


def test_correlation_id_not_in_error_body_for_missing_item():
    """The correlation ID does not appear inside the 404 error body."""
    request_id = "my-unique-observer-id-xyz"
    resp = client.get(
        "/items/nonexistent-sku",
        headers={"X-Request-ID": request_id},
    )
    assert resp.status_code == 404
    # The correlation id must live ONLY in the response header, never the body.
    assert request_id not in resp.text


def test_correlation_id_present_in_header_not_body_on_success():
    """On a 200 response the correlation ID is in the header, not the body."""
    request_id = "observability-only-id"
    resp = client.get("/", headers={"X-Request-ID": request_id})
    assert resp.status_code == 200
    # Header must carry the ID.
    assert resp.headers["X-Request-ID"] == request_id
    # Body must not carry the ID.
    assert request_id not in resp.text


def test_auto_generated_id_not_in_response_body():
    """The auto-generated UUID4 appears only in the response header, not the body."""
    resp = client.get("/")
    generated_id = resp.headers["X-Request-ID"]
    assert generated_id not in resp.text
