from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_slug_basic_text():
    r = client.post("/slug", json={"text": "Hello, World!"})
    assert r.status_code == 200
    assert r.json() == {"slug": "hello-world"}


def test_slug_accents_and_extra_whitespace():
    r = client.post("/slug", json={"text": "  Café   au   LAIT  "})
    assert r.status_code == 200
    assert r.json() == {"slug": "cafe-au-lait"}


def test_slug_no_alphanumeric_returns_422_not_empty_slug():
    r = client.post("/slug", json={"text": "!!!"})
    assert r.status_code == 422
    assert not (r.status_code == 200 and r.json().get("slug") == "")


def test_slug_long_text_is_truncated():
    r = client.post("/slug", json={"text": "a" * 300})
    assert r.status_code == 200
    assert len(r.json()["slug"]) <= 200


def test_slug_missing_text_field_returns_422():
    r = client.post("/slug", json={})
    assert r.status_code == 422
