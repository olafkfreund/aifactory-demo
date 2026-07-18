from fastapi.testclient import TestClient

from src.app.main import app

client = TestClient(app)


def test_root_returns_app_name():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json() == {"app": "aifactory-demo"}


def test_healthz_returns_alive():
    r = client.get("/healthz")
    assert r.status_code == 200
    assert r.json() == {"alive": True}
