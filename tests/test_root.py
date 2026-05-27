from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root_returns_app_name():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json() == {"app": "aifactory-demo"}


def test_ping_returns_pong():
    r = client.get("/ping")
    assert r.status_code == 200
    assert r.json() == {"pong": True}
