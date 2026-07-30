"""Tests for GET /links/{code} — AC#3 of the link shortener service."""

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def _clear_link_store():
    """Reset the link store before every test to keep tests independent."""
    from app.link_store import link_store

    with link_store._lock:
        link_store._links.clear()
    yield
    with link_store._lock:
        link_store._links.clear()


def test_get_link_returns_200_with_stored_url():
    """GET /links/{code} returns 200 and the stored url."""
    create_resp = client.post("/links", json={"url": "https://example.com"})
    assert create_resp.status_code == 201
    code = create_resp.json()["code"]

    get_resp = client.get(f"/links/{code}")
    assert get_resp.status_code == 200
    body = get_resp.json()
    assert body["code"] == code
    assert body["url"] == "https://example.com"


def test_get_link_returns_404_for_unknown_code():
    """GET /links/{unknown} returns 404."""
    resp = client.get("/links/aaaaaaa")
    assert resp.status_code == 404


def test_get_link_returns_correct_url_after_multiple_creates():
    """GET /links/{code} returns the exact url that was stored for that code."""
    url_a = "https://example.com/a"
    url_b = "https://example.com/b"

    resp_a = client.post("/links", json={"url": url_a})
    resp_b = client.post("/links", json={"url": url_b})
    assert resp_a.status_code == 201
    assert resp_b.status_code == 201

    code_a = resp_a.json()["code"]
    code_b = resp_b.json()["code"]

    assert client.get(f"/links/{code_a}").json()["url"] == url_a
    assert client.get(f"/links/{code_b}").json()["url"] == url_b
