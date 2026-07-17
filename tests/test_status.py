from fastapi.testclient import TestClient

from src.app.main import app

client = TestClient(app)


def test_status_returns_ok_with_uptime():
    r = client.get("/status")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert isinstance(body["uptime_seconds"], float)
