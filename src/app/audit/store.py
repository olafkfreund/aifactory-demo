"""Persistent storage backends for audit records.

The default backend, :class:`SQLiteAuditStore`, writes records to an on-disk
SQLite database so that the audit trail survives process restarts (AC2).
"""

from __future__ import annotations

import os
import sqlite3
import threading
from abc import ABC, abstractmethod
from pathlib import Path

from .models import AuditRecord, StatusClass

# Environment variable used to override the on-disk database location.
AUDIT_DB_ENV = "AUDIT_DB_PATH"
# Default location relative to the current working directory.
DEFAULT_DB_PATH = "data/audit.db"


class AuditStore(ABC):
    """Abstract interface for an audit-record store."""

    @abstractmethod
    def append(self, record: AuditRecord) -> AuditRecord:
        """Persist a single audit record and return it with its assigned id."""

    @abstractmethod
    def query(
        self,
        *,
        path_prefix: str | None = None,
        status_class: StatusClass | str | None = None,
        time_from: str | None = None,
        time_to: str | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[AuditRecord]:
        """Return records matching the given filters, newest first."""

    @abstractmethod
    def count(self) -> int:
        """Return the total number of stored records."""

    @abstractmethod
    def close(self) -> None:
        """Release any underlying resources."""


class SQLiteAuditStore(AuditStore):
    """SQLite-backed :class:`AuditStore`.

    Records are written to a durable on-disk database. Write-Ahead Logging
    and synchronous ``NORMAL`` mode are enabled so that committed records are
    retained across process restarts. The store is safe to use from the
    multiple worker threads FastAPI uses to run synchronous handlers.
    """

    def __init__(self, db_path: str | os.PathLike[str] | None = None) -> None:
        resolved = db_path if db_path is not None else os.environ.get(
            AUDIT_DB_ENV, DEFAULT_DB_PATH
        )
        self._path = Path(resolved)
        self._is_memory = str(resolved) == ":memory:"
        if not self._is_memory:
            self._path.parent.mkdir(parents=True, exist_ok=True)

        self._lock = threading.Lock()
        self._conn = sqlite3.connect(
            str(resolved),
            check_same_thread=False,
        )
        self._conn.row_factory = sqlite3.Row
        self._configure()
        self._create_schema()

    def _configure(self) -> None:
        # WAL keeps committed data durable across restarts while allowing
        # concurrent reads. Not supported for in-memory databases.
        if not self._is_memory:
            self._conn.execute("PRAGMA journal_mode=WAL")
        self._conn.execute("PRAGMA synchronous=NORMAL")

    def _create_schema(self) -> None:
        with self._lock:
            self._conn.execute(
                """
                CREATE TABLE IF NOT EXISTS audit_records (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    method TEXT NOT NULL,
                    path TEXT NOT NULL,
                    status_code INTEGER NOT NULL,
                    latency_ms REAL NOT NULL,
                    client_key TEXT,
                    timestamp TEXT NOT NULL
                )
                """
            )
            self._conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_audit_timestamp "
                "ON audit_records (timestamp)"
            )
            self._conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_audit_status "
                "ON audit_records (status_code)"
            )
            self._conn.commit()

    def append(self, record: AuditRecord) -> AuditRecord:
        with self._lock:
            cursor = self._conn.execute(
                """
                INSERT INTO audit_records
                    (method, path, status_code, latency_ms, client_key, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    record.method,
                    record.path,
                    record.status_code,
                    record.latency_ms,
                    record.client_key,
                    record.timestamp,
                ),
            )
            self._conn.commit()
            record.id = cursor.lastrowid
        return record

    def query(
        self,
        *,
        path_prefix: str | None = None,
        status_class: StatusClass | str | None = None,
        time_from: str | None = None,
        time_to: str | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[AuditRecord]:
        clauses: list[str] = []
        params: list[object] = []

        if path_prefix:
            clauses.append("path LIKE ? ESCAPE '\\'")
            params.append(f"{_escape_like(path_prefix)}%")

        if status_class is not None:
            resolved_class = (
                status_class
                if isinstance(status_class, StatusClass)
                else StatusClass(status_class)
            )
            clauses.append("status_code >= ? AND status_code < ?")
            params.extend([resolved_class.lower_bound, resolved_class.upper_bound])

        if time_from:
            clauses.append("timestamp >= ?")
            params.append(time_from)

        if time_to:
            clauses.append("timestamp <= ?")
            params.append(time_to)

        where = f" WHERE {' AND '.join(clauses)}" if clauses else ""
        sql = (
            "SELECT id, method, path, status_code, latency_ms, client_key, timestamp "
            f"FROM audit_records{where} "
            "ORDER BY id DESC LIMIT ? OFFSET ?"
        )
        params.extend([_clamp_limit(limit), max(0, int(offset))])

        with self._lock:
            rows = self._conn.execute(sql, params).fetchall()
        return [_row_to_record(row) for row in rows]

    def count(self) -> int:
        with self._lock:
            row = self._conn.execute(
                "SELECT COUNT(*) AS n FROM audit_records"
            ).fetchone()
        return int(row["n"])

    def close(self) -> None:
        with self._lock:
            self._conn.close()


def _row_to_record(row: sqlite3.Row) -> AuditRecord:
    return AuditRecord(
        id=row["id"],
        method=row["method"],
        path=row["path"],
        status_code=row["status_code"],
        latency_ms=row["latency_ms"],
        client_key=row["client_key"],
        timestamp=row["timestamp"],
    )


def _escape_like(value: str) -> str:
    """Escape LIKE wildcards so prefixes match literally."""
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def _clamp_limit(limit: int, maximum: int = 1000) -> int:
    """Bound the page size to a sane, non-negative range."""
    try:
        value = int(limit)
    except (TypeError, ValueError):
        return maximum
    return max(0, min(value, maximum))
