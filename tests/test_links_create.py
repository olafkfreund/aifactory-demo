"""Tests for POST /links — AC#1 and AC#2 of the link shortener service.

AC#1: POST /links accepts a URL body and returns 201 with a ``code`` and the
      original ``url``.
AC#2: The generated short code is exactly 7 lowercase alphanumeric characters.
"""

import re

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

_CODE_RE = re.compile(r"^[a-z0-9]{7}$")


@pytest.fixture(autouse=True)
def _clear_link_store():
    """Reset the link store before every test to keep tests independent."""
    from app.link_store import link_store

    with link_store._lock:
        link_store._links.clear()
    yield
    with link_store._lock:
        link_store._links.clear()


def test_create_link_returns_201():
    """POST /links returns 201 Created."""
    resp = client.post("/links", json={"url": "https://example.com"})
    assert resp.status_code == 201


def test_create_link_response_contains_code_and_url():
    """POST /links response body includes ``code`` and ``url`` fields."""
    resp = client.post("/links", json={"url": "https://example.com"})
    assert resp.status_code == 201
    body = resp.json()
    assert "code" in body
    assert "url" in body


def test_create_link_url_echoed_back():
    """POST /links response ``url`` matches the submitted URL."""
    target = "https://example.com/some/path"
    resp = client.post("/links", json={"url": target})
    assert resp.status_code == 201
    assert resp.json()["url"] == target


def test_create_link_code_is_seven_chars():
    """The short code returned by POST /links is exactly 7 characters long."""
    resp = client.post("/links", json={"url": "https://example.com"})
    assert resp.status_code == 201
    assert len(resp.json()["code"]) == 7


def test_create_link_code_is_lowercase_alphanumeric():
    """The short code contains only lowercase letters and digits."""
    resp = client.post("/links", json={"url": "https://example.com"})
    assert resp.status_code == 201
    assert _CODE_RE.match(resp.json()["code"]), (
        f"code {resp.json()['code']!r} does not match [a-z0-9]{{7}}"
    )


def test_create_multiple_links_return_unique_codes():
    """Multiple POST /links calls return distinct codes."""
    codes = {
        client.post("/links", json={"url": f"https://example.com/{i}"}).json()["code"]
        for i in range(10)
    }
    assert len(codes) == 10, "Expected each POST to return a unique code"


def test_create_link_missing_body_returns_422():
    """POST /links with no body returns 422 Unprocessable Entity."""
    resp = client.post("/links")
    assert resp.status_code == 422


def test_create_link_missing_url_field_returns_422():
    """POST /links with a body that omits ``url`` returns 422."""
    resp = client.post("/links", json={})
    assert resp.status_code == 422


def test_create_link_code_is_retrievable():
    """The code from POST /links can be used to GET /links/{code}."""
    create_resp = client.post("/links", json={"url": "https://example.com"})
    assert create_resp.status_code == 201
    code = create_resp.json()["code"]

    get_resp = client.get(f"/links/{code}")
    assert get_resp.status_code == 200
    assert get_resp.json()["url"] == "https://example.com"
