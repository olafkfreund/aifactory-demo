"""Tests for GET /r/{code} — AC#4 of the link shortener service.

Verifies that the redirect endpoint returns a 307 Temporary Redirect whose
Location header is the original stored URL.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app, follow_redirects=False)


@pytest.fixture(autouse=True)
def _clear_link_store():
    """Reset the link store before every test to keep tests independent."""
    from app.link_store import link_store

    with link_store._lock:
        link_store._links.clear()
    yield
    with link_store._lock:
        link_store._links.clear()


def test_redirect_returns_307():
    """GET /r/{code} returns 307 Temporary Redirect."""
    create_resp = client.post("/links", json={"url": "https://example.com"})
    assert create_resp.status_code == 201
    code = create_resp.json()["code"]

    redirect_resp = client.get(f"/r/{code}")
    assert redirect_resp.status_code == 307


def test_redirect_location_header_is_stored_url():
    """GET /r/{code} Location header equals the original stored url."""
    target_url = "https://example.com/target"
    create_resp = client.post("/links", json={"url": target_url})
    assert create_resp.status_code == 201
    code = create_resp.json()["code"]

    redirect_resp = client.get(f"/r/{code}")
    assert redirect_resp.status_code == 307
    assert redirect_resp.headers["location"] == target_url


def test_redirect_unknown_code_returns_404():
    """GET /r/{unknown} returns 404 for a code that does not exist."""
    resp = client.get("/r/aaaaaaa")
    assert resp.status_code == 404


def test_redirect_uses_correct_url_for_each_code():
    """Each shortened code redirects to its own stored url."""
    url_a = "https://example.com/alpha"
    url_b = "https://example.com/beta"

    code_a = client.post("/links", json={"url": url_a}).json()["code"]
    code_b = client.post("/links", json={"url": url_b}).json()["code"]

    resp_a = client.get(f"/r/{code_a}")
    resp_b = client.get(f"/r/{code_b}")

    assert resp_a.headers["location"] == url_a
    assert resp_b.headers["location"] == url_b
