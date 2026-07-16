from fastapi.testclient import TestClient

from src.app.main import app

client = TestClient(app)


def test_root_returns_app_name():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json() == {"app": "aifactory-demo"}


def test_word_count_single_word():
    r = client.post("/word-count", json={"text": "hello"})
    assert r.status_code == 200
    assert r.json() == {"word_count": 1}


def test_word_count_multiple_words():
    r = client.post("/word-count", json={"text": "hello world"})
    assert r.status_code == 200
    assert r.json() == {"word_count": 2}


def test_word_count_empty_string():
    r = client.post("/word-count", json={"text": ""})
    assert r.status_code == 200
    assert r.json() == {"word_count": 0}


def test_word_count_whitespace_only():
    r = client.post("/word-count", json={"text": "   "})
    assert r.status_code == 200
    assert r.json() == {"word_count": 0}


def test_word_count_with_leading_trailing_whitespace():
    r = client.post("/word-count", json={"text": "  hello  world  "})
    assert r.status_code == 200
    assert r.json() == {"word_count": 2}
