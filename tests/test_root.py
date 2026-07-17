from fastapi.testclient import TestClient

from src.app.main import app

client = TestClient(app)


def test_root_returns_app_name():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json() == {"app": "aifactory-demo"}


def test_health_returns_ok():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}
