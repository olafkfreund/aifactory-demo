"""Tests for X-Request-ID length-validation guard (AC#4).

AC#4: A client-supplied id longer than 200 characters is rejected with
      HTTP 400 rather than echoed, so the header cannot inject unbounded
      data into the logs.
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

_MAX_LEN = 200


# ---------------------------------------------------------------------------
# AC#4 — reject oversized X-Request-ID headers
# ---------------------------------------------------------------------------


def test_request_id_at_max_length_is_accepted():
    """A 200-character X-Request-ID is exactly at the limit and must be echoed."""
    request_id = "a" * _MAX_LEN
    resp = client.get("/", headers={"X-Request-ID": request_id})
    assert resp.status_code == 200
    assert resp.headers["X-Request-ID"] == request_id


def test_request_id_one_over_max_length_is_rejected():
    """A 201-character X-Request-ID exceeds the limit and must return HTTP 400."""
    request_id = "a" * (_MAX_LEN + 1)
    resp = client.get("/", headers={"X-Request-ID": request_id})
    assert resp.status_code == 400


def test_request_id_well_over_max_length_is_rejected():
    """A very long X-Request-ID (1000 chars) is rejected with HTTP 400."""
    request_id = "x" * 1000
    resp = client.get("/", headers={"X-Request-ID": request_id})
    assert resp.status_code == 400


def test_oversized_request_id_returns_json_detail():
    """HTTP 400 for an oversized id includes a JSON 'detail' field."""
    request_id = "b" * (_MAX_LEN + 1)
    resp = client.get("/", headers={"X-Request-ID": request_id})
    assert resp.status_code == 400
    body = resp.json()
    assert "detail" in body


def test_oversized_request_id_rejected_on_post():
    """Length validation applies to POST endpoints, not just GET."""
    request_id = "z" * (_MAX_LEN + 50)
    resp = client.post(
        "/items",
        json={"sku": "sku-length-test", "total": 1},
        headers={"X-Request-ID": request_id},
    )
    assert resp.status_code == 400


def test_oversized_request_id_rejected_on_healthz():
    """Length validation applies to all endpoints including /healthz."""
    request_id = "h" * (_MAX_LEN + 1)
    resp = client.get("/healthz", headers={"X-Request-ID": request_id})
    assert resp.status_code == 400


def test_request_id_just_under_max_length_is_accepted():
    """A 199-character X-Request-ID is under the limit and must be accepted."""
    request_id = "c" * (_MAX_LEN - 1)
    resp = client.get("/", headers={"X-Request-ID": request_id})
    assert resp.status_code == 200
    assert resp.headers["X-Request-ID"] == request_id
