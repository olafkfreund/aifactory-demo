"""Shared fixtures for the request-audit trail test suite.

Builds an isolated FastAPI application wired with the audit middleware (AC1/AC4)
and the ``/api/audit`` query endpoint (AC3), each backed by a per-test on-disk
SQLite store so cases never share state and persistence can be exercised across
simulated restarts (AC2).
"""

from __future__ import annotations

import sys
from collections.abc import Callable, Iterator
from pathlib import Path

import pytest

# Ensure the project root is importable as ``src.app`` regardless of the
# directory pytest is invoked from.
_ROOT = Path(__file__).resolve().parents[1]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from fastapi import FastAPI, HTTPException  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from src.app.audit.api import get_audit_store, router  # noqa: E402
from src.app.audit.middleware import AuditMiddleware  # noqa: E402
from src.app.audit.store import SQLiteAuditStore  # noqa: E402


@pytest.fixture
def db_path(tmp_path: Path) -> str:
    """Return a temporary on-disk SQLite path unique to each test."""
    return str(tmp_path / "audit.db")


@pytest.fixture
def store(db_path: str) -> Iterator[SQLiteAuditStore]:
    """Provide an isolated on-disk audit store, closed on teardown."""
    audit_store = SQLiteAuditStore(db_path)
    try:
        yield audit_store
    finally:
        audit_store.close()


def build_app(store: SQLiteAuditStore) -> FastAPI:
    """Build a FastAPI app wired to *store* with a few exerciseable routes.

    The audit middleware and query router are both bound to the supplied store,
    mirroring how the real application wires them while keeping each test fully
    isolated.
    """
    app = FastAPI()
    app.add_middleware(AuditMiddleware, store_factory=lambda: store)
    app.include_router(router)
    app.dependency_overrides[get_audit_store] = lambda: store

    @app.get("/api/things")
    async def list_things() -> dict[str, bool]:  # pragma: no cover - trivial
        return {"ok": True}

    @app.post("/api/things", status_code=201)
    async def create_thing() -> dict[str, bool]:  # pragma: no cover - trivial
        return {"created": True}

    @app.get("/api/widgets")
    async def list_widgets() -> dict[str, bool]:  # pragma: no cover - trivial
        return {"ok": True}

    @app.get("/api/missing")
    async def missing() -> None:  # pragma: no cover - trivial
        raise HTTPException(status_code=404, detail="nope")

    @app.get("/api/broken")
    async def broken() -> None:  # pragma: no cover - trivial
        raise HTTPException(status_code=500, detail="boom")

    return app


@pytest.fixture
def app_factory() -> Callable[[SQLiteAuditStore], FastAPI]:
    """Expose :func:`build_app` as a fixture for tests that need custom wiring."""
    return build_app


@pytest.fixture
def client(store: SQLiteAuditStore) -> Iterator[TestClient]:
    """A ``TestClient`` for an app whose middleware and endpoint share *store*."""
    with TestClient(build_app(store)) as test_client:
        yield test_client
