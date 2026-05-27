from unittest.mock import patch

from fastapi.testclient import TestClient

from src.app.main import app

client = TestClient(app)


def test_healthz_db_returns_ok():
    response = client.get("/healthz/db")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "db": "ok"}


def test_healthz_db_returns_503_on_error():
    with patch("src.app.main.sqlite3.connect", side_effect=Exception("connection failed")):
        response = client.get("/healthz/db")
    assert response.status_code == 503
    assert response.json()["detail"]["status"] == "error"
