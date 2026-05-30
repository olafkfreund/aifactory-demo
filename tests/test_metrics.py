from fastapi.testclient import TestClient

from src.app.main import app, _request_counts

client = TestClient(app)


def test_metrics_returns_200():
    r = client.get("/metrics")
    assert r.status_code == 200


def test_metrics_contains_total_requests_integer():
    r = client.get("/metrics")
    assert r.status_code == 200
    body = r.json()
    assert "total_requests" in body
    assert isinstance(body["total_requests"], int)


def test_metrics_count_increments_across_requests():
    r1 = client.get("/metrics")
    count_before = r1.json()["total_requests"]

    client.get("/metrics")

    r2 = client.get("/metrics")
    count_after = r2.json()["total_requests"]

    assert count_after > count_before
