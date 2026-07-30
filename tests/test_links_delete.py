"""Tests for DELETE /links/{code} — AC#6 of the link shortener service.

Verifies that a short link can be deleted, that subsequent reads return 404,
and that redirects to the deleted code also return 404.
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


def test_delete_returns_204():
    """DELETE /links/{code} returns 204 No Content for an existing code."""
    create_resp = client.post("/links", json={"url": "https://example.com"})
    assert create_resp.status_code == 201
    code = create_resp.json()["code"]

    delete_resp = client.delete(f"/links/{code}")
    assert delete_resp.status_code == 204


def test_delete_makes_get_return_404():
    """After DELETE /links/{code}, GET /links/{code} returns 404."""
    create_resp = client.post("/links", json={"url": "https://example.com"})
    assert create_resp.status_code == 201
    code = create_resp.json()["code"]

    client.delete(f"/links/{code}")

    get_resp = client.get(f"/links/{code}")
    assert get_resp.status_code == 404


def test_delete_makes_redirect_return_404():
    """After DELETE /links/{code}, GET /r/{code} returns 404."""
    create_resp = client.post("/links", json={"url": "https://example.com"})
    assert create_resp.status_code == 201
    code = create_resp.json()["code"]

    client.delete(f"/links/{code}")

    redirect_resp = client.get(f"/r/{code}")
    assert redirect_resp.status_code == 404


def test_delete_unknown_code_returns_404():
    """DELETE /links/{unknown} returns 404."""
    resp = client.delete("/links/aaaaaaa")
    assert resp.status_code == 404


def test_delete_only_removes_targeted_code():
    """DELETE /links/{code_a} does not affect code_b."""
    code_a = client.post("/links", json={"url": "https://example.com/a"}).json()["code"]
    code_b = client.post("/links", json={"url": "https://example.com/b"}).json()["code"]

    client.delete(f"/links/{code_a}")

    assert client.get(f"/links/{code_a}").status_code == 404
    assert client.get(f"/links/{code_b}").status_code == 200
