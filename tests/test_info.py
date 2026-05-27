from fastapi.testclient import TestClient

from src.app.main import app

client = TestClient(app)


def test_info_returns_version():
    r = client.get("/info")
    assert r.status_code == 200
    assert r.json() == {"version": "0.1"}
