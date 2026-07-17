"""Data model for audit records."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum


def _utcnow_iso() -> str:
    """Return the current UTC time as an ISO-8601 string with offset."""
    return datetime.now(timezone.utc).isoformat()


class StatusClass(str, Enum):
    """HTTP status code classes used for filtering audit records."""

    SUCCESS = "2xx"
    CLIENT_ERROR = "4xx"
    SERVER_ERROR = "5xx"

    @classmethod
    def from_status_code(cls, status_code: int) -> "StatusClass | None":
        """Map an HTTP status code to its class, or ``None`` if out of range."""
        if 200 <= status_code < 300:
            return cls.SUCCESS
        if 400 <= status_code < 500:
            return cls.CLIENT_ERROR
        if 500 <= status_code < 600:
            return cls.SERVER_ERROR
        return None

    @property
    def lower_bound(self) -> int:
        """Inclusive lower bound of the status code range."""
        return int(self.value[0]) * 100

    @property
    def upper_bound(self) -> int:
        """Exclusive upper bound of the status code range."""
        return self.lower_bound + 100


@dataclass(slots=True)
class AuditRecord:
    """A single audited API request.

    Attributes:
        method: HTTP method of the request (e.g. ``GET``).
        path: Request path (e.g. ``/api/things``).
        status_code: HTTP status code returned to the client.
        latency_ms: Time taken to handle the request, in milliseconds.
        client_key: Identifier of the authenticated client, if any.
        timestamp: ISO-8601 UTC timestamp of when the request was recorded.
        id: Auto-assigned row id once the record is persisted.
    """

    method: str
    path: str
    status_code: int
    latency_ms: float
    client_key: str | None = None
    timestamp: str = field(default_factory=_utcnow_iso)
    id: int | None = None

    def to_dict(self) -> dict:
        """Serialise the record to a JSON-friendly dictionary."""
        return {
            "id": self.id,
            "method": self.method,
            "path": self.path,
            "status_code": self.status_code,
            "latency_ms": self.latency_ms,
            "client_key": self.client_key,
            "timestamp": self.timestamp,
        }
