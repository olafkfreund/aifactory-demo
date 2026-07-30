"""Tests for GET /links/{code}/stats — AC#5 of the link shortener service.

Verifies that the stats endpoint returns the hit count alongside code and url,
and that hits increment correctly after each redirect.
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


def test_stats_returns_200_with_zero_hits_initially():
    """GET /links/{code}/stats returns 200 and hits=0 for a freshly created link."""
    create_resp = client.post("/links", json={"url": "https://example.com"})
    assert create_resp.status_code == 201
    code = create_resp.json()["code"]

    stats_resp = client.get(f"/links/{code}/stats")
    assert stats_resp.status_code == 200
    body = stats_resp.json()
    assert body["code"] == code
    assert body["url"] == "https://example.com"
    assert body["hits"] == 0


def test_stats_returns_404_for_unknown_code():
    """GET /links/{unknown}/stats returns 404."""
    resp = client.get("/links/aaaaaaa/stats")
    assert resp.status_code == 404


def test_stats_increments_after_each_redirect():
    """GET /links/{code}/stats hits increases by 1 for each redirect visit."""
    create_resp = client.post("/links", json={"url": "https://example.com/target"})
    assert create_resp.status_code == 201
    code = create_resp.json()["code"]

    # Before any redirects, hits should be 0.
    assert client.get(f"/links/{code}/stats").json()["hits"] == 0

    # Each redirect increments the hit counter.
    client.get(f"/r/{code}")
    assert client.get(f"/links/{code}/stats").json()["hits"] == 1

    client.get(f"/r/{code}")
    assert client.get(f"/links/{code}/stats").json()["hits"] == 2

    client.get(f"/r/{code}")
    assert client.get(f"/links/{code}/stats").json()["hits"] == 3


def test_stats_tracks_hits_independently_per_code():
    """Each short code maintains its own hit counter."""
    url_a = "https://example.com/a"
    url_b = "https://example.com/b"

    code_a = client.post("/links", json={"url": url_a}).json()["code"]
    code_b = client.post("/links", json={"url": url_b}).json()["code"]

    # Visit code_a twice, code_b once.
    client.get(f"/r/{code_a}")
    client.get(f"/r/{code_a}")
    client.get(f"/r/{code_b}")

    assert client.get(f"/links/{code_a}/stats").json()["hits"] == 2
    assert client.get(f"/links/{code_b}/stats").json()["hits"] == 1
