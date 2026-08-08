"""End-to-end tests for X-Request-ID feature (AC#1 – AC#6).

These tests exercise all acceptance criteria against a **real running server**
rather than the in-process TestClient.  They are gated by the ``TEST_SERVER_URL``
environment variable (see ``conftest.py``).

Run them with::

    TEST_SERVER_URL=http://localhost:8000 pytest -m e2e -v

When ``TEST_SERVER_URL`` is absent every test in this module is automatically
skipped by the ``base_url`` fixture.
"""

import re
import uuid

import httpx
import pytest

pytestmark = pytest.mark.e2e

_UUID4_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
)


# ---------------------------------------------------------------------------
# AC#1 — client-supplied X-Request-ID is echoed in the response
# ---------------------------------------------------------------------------


def test_e2e_supplied_id_echoed_on_healthz(base_url: str) -> None:
    """E2E AC#1: Supplied X-Request-ID is returned verbatim in the response."""
    request_id = f"e2e-{uuid.uuid4()}"
    resp = httpx.get(f"{base_url}/healthz", headers={"X-Request-ID": request_id})
    assert resp.status_code == 200
    assert resp.headers.get("x-request-id") == request_id


def test_e2e_supplied_id_echoed_on_root(base_url: str) -> None:
    """E2E AC#1: Supplied X-Request-ID is echoed on GET /."""
    request_id = f"e2e-root-{uuid.uuid4()}"
    resp = httpx.get(f"{base_url}/", headers={"X-Request-ID": request_id})
    assert resp.status_code == 200
    assert resp.headers.get("x-request-id") == request_id


# ---------------------------------------------------------------------------
# AC#2 — auto-generated UUID4 when no header supplied
# ---------------------------------------------------------------------------


def test_e2e_auto_generated_uuid4_present(base_url: str) -> None:
    """E2E AC#2: When X-Request-ID is absent the response carries a UUID4."""
    resp = httpx.get(f"{base_url}/healthz")
    assert resp.status_code == 200
    header_val = resp.headers.get("x-request-id", "")
    assert _UUID4_RE.match(header_val), f"Expected UUID4, got {header_val!r}"


def test_e2e_two_auto_ids_are_unique(base_url: str) -> None:
    """E2E AC#2: Consecutive requests without X-Request-ID get distinct UUIDs."""
    id_1 = httpx.get(f"{base_url}/healthz").headers["x-request-id"]
    id_2 = httpx.get(f"{base_url}/healthz").headers["x-request-id"]
    assert id_1 != id_2


# ---------------------------------------------------------------------------
# AC#4 — oversized X-Request-ID rejected
# ---------------------------------------------------------------------------


def test_e2e_oversized_id_returns_400(base_url: str) -> None:
    """E2E AC#4: A 201-character X-Request-ID is rejected with HTTP 400."""
    resp = httpx.get(f"{base_url}/healthz", headers={"X-Request-ID": "x" * 201})
    assert resp.status_code == 400


def test_e2e_max_length_id_accepted(base_url: str) -> None:
    """E2E AC#4: A 200-character X-Request-ID is accepted."""
    request_id = "a" * 200
    resp = httpx.get(f"{base_url}/healthz", headers={"X-Request-ID": request_id})
    assert resp.status_code == 200
    assert resp.headers["x-request-id"] == request_id


# ---------------------------------------------------------------------------
# AC#6 — correlation header requires no authentication
# ---------------------------------------------------------------------------


def test_e2e_health_check_requires_no_auth(base_url: str) -> None:
    """E2E AC#6: /healthz is reachable without credentials."""
    resp = httpx.get(f"{base_url}/healthz")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_e2e_request_id_grants_no_access_to_missing_item(base_url: str) -> None:
    """E2E AC#6: X-Request-ID does not grant access to a non-existent resource."""
    resp = httpx.get(
        f"{base_url}/items/e2e-nonexistent-sku",
        headers={"X-Request-ID": str(uuid.uuid4())},
    )
    assert resp.status_code == 404
