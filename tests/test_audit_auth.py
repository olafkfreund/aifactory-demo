"""Unit tests for the audit query API's client-key authentication (AC6).

Exercises :func:`~app.audit.auth.require_client_key` and its supporting helpers
directly, independent of the HTTP stack:

* a missing key is rejected with ``401``;
* an unrecognised key is rejected with ``403``;
* a valid key is accepted and returned;
* the allowlist is parsed from the ``AUDIT_CLIENT_KEYS`` environment variable.
"""

from __future__ import annotations

import pytest
from fastapi import HTTPException

from src.app.audit.auth import (
    CLIENT_KEYS_ENV,
    _parse_keys,
    get_valid_client_keys,
    require_client_key,
)


def test_require_client_key_returns_valid_key() -> None:
    assert require_client_key(x_client_key="k1", valid_keys={"k1", "k2"}) == "k1"


def test_require_client_key_rejects_missing_key() -> None:
    with pytest.raises(HTTPException) as excinfo:
        require_client_key(x_client_key=None, valid_keys={"k1"})
    assert excinfo.value.status_code == 401


def test_require_client_key_rejects_empty_key() -> None:
    with pytest.raises(HTTPException) as excinfo:
        require_client_key(x_client_key="", valid_keys={"k1"})
    assert excinfo.value.status_code == 401


def test_require_client_key_rejects_unknown_key() -> None:
    with pytest.raises(HTTPException) as excinfo:
        require_client_key(x_client_key="bogus", valid_keys={"k1"})
    assert excinfo.value.status_code == 403


def test_require_client_key_rejects_when_no_keys_configured() -> None:
    # Fail closed: with an empty allowlist every key is invalid.
    with pytest.raises(HTTPException) as excinfo:
        require_client_key(x_client_key="anything", valid_keys=set())
    assert excinfo.value.status_code == 403


def test_parse_keys_splits_and_trims() -> None:
    assert _parse_keys(" k1 , k2 ,, k3 ") == {"k1", "k2", "k3"}


def test_parse_keys_handles_empty_and_none() -> None:
    assert _parse_keys(None) == set()
    assert _parse_keys("") == set()
    assert _parse_keys("   ") == set()


def test_get_valid_client_keys_reads_environment(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv(CLIENT_KEYS_ENV, "alpha, beta")
    assert get_valid_client_keys() == {"alpha", "beta"}


def test_get_valid_client_keys_defaults_empty(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.delenv(CLIENT_KEYS_ENV, raising=False)
    assert get_valid_client_keys() == set()
