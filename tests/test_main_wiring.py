"""Smoke tests that boot the REAL deployable entrypoint (``src.app.main:app``).

The rest of the suite exercises a test-only app assembled in ``conftest.py``.
These tests instead drive the shipped application object directly, so a
regression that leaves the audit middleware/router unwired (the #611
"unbootable artifact" failure) is caught automatically: deleting the wiring
from ``src/app/main.py`` makes them fail.
"""

from __future__ import annotations

import importlib

import pytest
from fastapi.testclient import TestClient

from src.app.audit.auth import CLIENT_KEYS_ENV, CLIENT_KEY_HEADER


@pytest.fixture
def real_app(tmp_path, monkeypatch):
    """Reload ``src.app.main`` with an isolated store + client-key allowlist."""
    monkeypatch.setenv("AUDIT_DB_PATH", str(tmp_path / "audit.db"))
    monkeypatch.setenv(CLIENT_KEYS_ENV, "smoke-key")

    import src.app.main as main

    main = importlib.reload(main)
    try:
        yield main.app
    finally:
        # Reset the process-wide store so reloads don't leak between tests.
        from src.app.audit.api import set_audit_store

        set_audit_store(None)


def test_health_endpoint_returns_200(real_app):
    with TestClient(real_app) as client:
        response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_audit_endpoint_exists_and_enforces_auth(real_app):
    with TestClient(real_app) as client:
        # 401 when no client key is supplied (route exists, auth enforced).
        missing = client.get("/api/audit")
        assert missing.status_code == 401

        # 403 with a wrong key.
        wrong = client.get("/api/audit", headers={CLIENT_KEY_HEADER: "nope"})
        assert wrong.status_code == 403


def test_requests_are_recorded_and_queryable(real_app):
    headers = {CLIENT_KEY_HEADER: "smoke-key"}
    with TestClient(real_app) as client:
        # Make a request that should be recorded by the middleware.
        assert client.get("/").status_code == 200

        # The recorded request is queryable through the wired endpoint.
        response = client.get("/api/audit", headers=headers)
        assert response.status_code == 200
        body = response.json()
        paths = {item["path"] for item in body["items"]}
        assert "/" in paths


def test_openapi_exposes_audit_route(real_app):
    with TestClient(real_app) as client:
        schema = client.get("/openapi.json").json()
    assert "/api/audit" in schema["paths"]
    assert "/health" in schema["paths"]
