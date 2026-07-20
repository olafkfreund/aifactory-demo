from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root_returns_app_name():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json() == {"app": "aifactory-demo"}


def test_factorial_endpoint_with_zero():
    r = client.get("/factorial/0")
    assert r.status_code == 200
    assert r.json() == {"factorial": 1}


def test_factorial_endpoint_with_five():
    r = client.get("/factorial/5")
    assert r.status_code == 200
    assert r.json() == {"factorial": 120}


def test_factorial_endpoint_with_negative_returns_error():
    r = client.get("/factorial/-1")
    assert r.status_code == 400
