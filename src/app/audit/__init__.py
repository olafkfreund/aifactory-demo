"""Request-audit trail: persistent storage of API request records.

This package provides the persistence layer for the audit trail. Audit
records are written to a durable SQLite database so they survive process
restarts (see :class:`SQLiteAuditStore`).
"""

from .models import AuditRecord, StatusClass
from .store import AuditStore, SQLiteAuditStore

__all__ = [
    "AuditRecord",
    "StatusClass",
    "AuditStore",
    "SQLiteAuditStore",
]
