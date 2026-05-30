from fastapi.testclient import TestClient

from src.app.main import app

client = TestClient(app)


def test_echo_returns_200():
    r = client.get("/echo?msg=hello")
    assert r.status_code == 200


def test_echo_returns_msg_in_body():
    r = client.get("/echo?msg=hello")
    assert r.json() == {"echo": "hello"}


def test_echo_reflects_arbitrary_message():
    r = client.get("/echo?msg=world")
    assert r.status_code == 200
    assert r.json() == {"echo": "world"}
