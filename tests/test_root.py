from fastapi.testclient import TestClient

from src.app.main import app
from src.app import __version__

client = TestClient(app)


def test_root_returns_app_name():
    r = client.get("/")
    assert r.status_code == 200
    json_data = r.json()
    assert json_data["app"] == "aifactory-demo"
    assert "version" in json_data
    assert json_data["version"] == __version__
