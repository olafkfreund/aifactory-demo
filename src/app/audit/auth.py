"""Client-key authentication for the audit query API (AC6).

The audit trail exposes sensitive request metadata, so ``GET /api/audit`` must
only be served to callers presenting a valid client key. This module provides a
FastAPI dependency, :func:`require_client_key`, that reads the caller's key from
the ``X-Client-Key`` request header and rejects the request when the key is
missing (``401 Unauthorized``) or not recognised (``403 Forbidden``). Audit
records are therefore never exposed to unauthenticated callers.

Valid keys are configured out of band via the ``AUDIT_CLIENT_KEYS`` environment
variable, a comma-separated allowlist. The lookup is exposed through the
:func:`get_valid_client_keys` dependency so tests (and alternative wiring) can
override it with an isolated set via ``app.dependency_overrides``.
"""

from __future__ import annotations

import os

from fastapi import Depends, Header, HTTPException, status

# Request header carrying the caller's client key (mirrors the audit middleware).
CLIENT_KEY_HEADER = "x-client-key"
# Environment variable holding the comma-separated allowlist of valid client keys.
CLIENT_KEYS_ENV = "AUDIT_CLIENT_KEYS"


def _parse_keys(raw: str | None) -> set[str]:
    """Parse a comma-separated allowlist into a set of non-empty client keys."""
    if not raw:
        return set()
    return {key.strip() for key in raw.split(",") if key.strip()}


def get_valid_client_keys() -> set[str]:
    """Return the set of accepted client keys.

    Reads the allowlist from the ``AUDIT_CLIENT_KEYS`` environment variable.
    Exposed as a FastAPI dependency so tests can override it with an isolated
    set via ``app.dependency_overrides``.
    """
    return _parse_keys(os.environ.get(CLIENT_KEYS_ENV))


def require_client_key(
    x_client_key: str | None = Header(default=None, alias=CLIENT_KEY_HEADER),
    valid_keys: set[str] = Depends(get_valid_client_keys),
) -> str:
    """Authenticate the caller by its client key, or reject the request (AC6).

    Args:
        x_client_key: Value of the ``X-Client-Key`` request header, if present.
        valid_keys: Allowlist of accepted client keys.

    Returns:
        The validated client key.

    Raises:
        HTTPException: ``401 Unauthorized`` when no client key is supplied and
            ``403 Forbidden`` when the supplied key is not in the allowlist. In
            both cases the request never reaches the handler, so audit records
            are not exposed to unauthenticated or unauthorised callers.
    """
    if not x_client_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing client key.",
            headers={"WWW-Authenticate": CLIENT_KEY_HEADER},
        )
    if x_client_key not in valid_keys:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid client key.",
        )
    return x_client_key
