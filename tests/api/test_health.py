# AC#1: GET /health returns 200 and {"status":"ok"}.

import os

import requests


def test_health_returns_200_status_ok():
    base_url = os.environ["TFACTORY_TARGET_URL"]
    resp = requests.get(f"{base_url}/health", timeout=10)
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}
