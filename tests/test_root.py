from fastapi.testclient import TestClient

from src.app.main import app

client = TestClient(app)


def test_root_returns_app_name():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json() == {"app": "aifactory-demo"}


def test_version_returns_version_string():
    r = client.get("/version")
    assert r.status_code == 200
    assert "version" in r.json()
    assert isinstance(r.json()["version"], str)
