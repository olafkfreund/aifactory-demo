"""AC7 — access-control tests for POST /api/quote.

AC7: ``POST /api/quote`` is intentionally unauthenticated and requires no
authorisation check, because it is a pure stateless calculator over values
supplied in the request body.

To make that decision safe, the following invariants are verified here:

1. The endpoint is reachable without any authentication or authorisation
   header — callers do not need to supply credentials.
2. The endpoint returns an identical response for an identical request body,
   regardless of which headers (or fake "caller identity" headers) accompany
   the request.  This proves it is not personalising results to a caller.
3. The ``QuoteRequest`` model contains no field that could scope the result to
   a specific caller (e.g. ``user_id``, ``account_id``, ``token``).
4. The ``vat_quote`` module does not import any database driver, HTTP client,
   secret/credential library, or file I/O that would contradict the
   "pure stateless calculator" guarantee.

These checks are complementary to the functional tests in ``test_vat_quote.py``
and the other AC-specific files; they exist purely to surface any regression
that would invalidate the unauthenticated access-control decision.
"""

from __future__ import annotations

import ast
import importlib.util
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.vat_quote import QuoteRequest, router

# ---------------------------------------------------------------------------
# Shared test client — router mounted on a local FastAPI app for isolation.
# ---------------------------------------------------------------------------

_app = FastAPI()
_app.include_router(router)

client = TestClient(_app)


def _quote(payload: dict, headers: dict | None = None) -> tuple[int, dict]:
    """POST /api/quote and return ``(status_code, json_body)``."""
    r = client.post("/api/quote", json=payload, headers=headers or {})
    return r.status_code, (r.json() if r.status_code == 200 else {})


# ---------------------------------------------------------------------------
# 1. Endpoint is reachable without any authentication
# ---------------------------------------------------------------------------


def test_ac7_endpoint_accessible_with_no_auth_headers():
    """A valid request with no auth headers must return HTTP 200."""
    status, _ = _quote({"subtotal": 100.0, "vat_rate": 0.2})
    assert status == 200


def test_ac7_endpoint_accessible_with_empty_headers():
    """Explicitly passing an empty header dict must still return HTTP 200."""
    status, _ = _quote({"subtotal": 50.0, "vat_rate": 0.1}, headers={})
    assert status == 200


def test_ac7_endpoint_returns_no_www_authenticate_challenge():
    """A 200 response must not include a WWW-Authenticate header (no auth challenge)."""
    r = client.post("/api/quote", json={"subtotal": 100.0, "vat_rate": 0.2})
    assert r.status_code == 200
    assert "www-authenticate" not in {h.lower() for h in r.headers}


# ---------------------------------------------------------------------------
# 2. Same request body → same response regardless of caller identity
# ---------------------------------------------------------------------------


_PAYLOAD = {"subtotal": 75.5, "vat_rate": 0.15, "discount_pct": 5}

_CALLER_HEADERS = [
    {},  # anonymous
    {"X-User-ID": "user-abc"},  # fake user header
    {"X-User-ID": "user-xyz", "X-Session": "sess-123"},  # different user
    {"Authorization": "Bearer some-token"},  # bearer token present
    {"Authorization": "Basic dXNlcjpwYXNz"},  # basic auth present
    {"X-Api-Key": "key-for-user-1"},  # API key header
    {"X-Tenant-ID": "tenant-42"},  # multi-tenant header
]


def test_ac7_same_body_returns_same_result_for_all_callers():
    """Identical request bodies produce identical responses regardless of who sends them."""
    results = []
    for headers in _CALLER_HEADERS:
        status, body = _quote(_PAYLOAD, headers=headers)
        assert status == 200, f"Expected 200 for headers={headers}, got {status}"
        results.append(body)

    # All responses must be bit-for-bit identical.
    for body in results[1:]:
        assert body == results[0], (
            f"Response differed between callers.\n"
            f"  baseline: {results[0]}\n"
            f"  diverged: {body}"
        )


def test_ac7_multiple_calls_same_body_are_deterministic():
    """Calling the endpoint twice with the same payload yields the same result."""
    payload = {"subtotal": 123.45, "vat_rate": 0.2, "discount_pct": 10}
    _, r1 = _quote(payload)
    _, r2 = _quote(payload)
    assert r1 == r2, f"Responses differed: {r1} vs {r2}"


# ---------------------------------------------------------------------------
# 3. QuoteRequest model has no caller-scoping identifier fields
# ---------------------------------------------------------------------------

# Fields whose presence would imply the handler personalises responses to a
# specific caller — if any appear in QuoteRequest, the unauthenticated decision
# is no longer safe.
_FORBIDDEN_FIELDS = frozenset(
    {
        "user_id",
        "user",
        "account_id",
        "account",
        "customer_id",
        "customer",
        "session_id",
        "session",
        "token",
        "api_key",
        "caller_id",
        "tenant_id",
        "tenant",
        "org_id",
        "org",
        "client_id",
        "client",
    }
)


def test_ac7_request_model_has_no_caller_scoping_fields():
    """QuoteRequest must contain no field that could select a specific caller's data."""
    model_fields = frozenset(QuoteRequest.model_fields.keys())
    offenders = model_fields & _FORBIDDEN_FIELDS
    assert not offenders, (
        f"QuoteRequest contains caller-scoping field(s): {sorted(offenders)}. "
        "Add authentication before allowing per-caller data lookups."
    )


def test_ac7_request_model_only_contains_numeric_calculation_inputs():
    """QuoteRequest fields are limited to the three documented calculation inputs."""
    expected = frozenset({"subtotal", "vat_rate", "discount_pct"})
    actual = frozenset(QuoteRequest.model_fields.keys())
    assert actual == expected, (
        f"QuoteRequest fields changed unexpectedly.\n"
        f"  expected: {sorted(expected)}\n"
        f"  actual:   {sorted(actual)}\n"
        "Adding new fields may require revisiting the unauthenticated access decision."
    )


# ---------------------------------------------------------------------------
# 4. Static check: vat_quote module imports no forbidden libraries
# ---------------------------------------------------------------------------

# Modules that would contradict the "pure stateless calculator" guarantee.
# The check is performed via AST parsing of the source file to catch both
# ``import X`` and ``from X import Y`` forms without actually importing them.
_FORBIDDEN_MODULES = {
    # Database drivers
    "sqlalchemy",
    "psycopg",
    "psycopg2",
    "pymongo",
    "motor",
    "aiomysql",
    "asyncpg",
    "databases",
    "tortoise",
    "peewee",
    # HTTP / network clients
    "requests",
    "httpx",
    "aiohttp",
    "urllib.request",
    "urllib3",
    # Credential / secret stores
    "boto3",
    "botocore",
    "google.cloud",
    "azure",
    "hvac",  # HashiCorp Vault
    "secretsmanager",
    # File I/O (builtin ``open`` is caught separately below)
    "pathlib",
    "shutil",
    "tempfile",
    # Subprocess / OS shell
    "subprocess",
    "shlex",
}


def _get_vat_quote_source() -> str:
    """Return the source code of ``app.vat_quote`` as a string."""
    spec = importlib.util.find_spec("app.vat_quote")
    assert spec is not None and spec.origin is not None, (
        "Cannot locate app.vat_quote source file"
    )
    return Path(spec.origin).read_text(encoding="utf-8")


def _collect_imports(source: str) -> set[str]:
    """Parse *source* and return all top-level module names referenced in imports."""
    tree = ast.parse(source)
    names: set[str] = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                # ``import os.path`` → top-level name is ``os``
                names.add(alias.name.split(".")[0])
                names.add(alias.name)  # also store full dotted name
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                names.add(node.module.split(".")[0])
                names.add(node.module)
    return names


def test_ac7_module_imports_no_database_or_network_library():
    """vat_quote.py must not import any database driver or network client (AC7)."""
    source = _get_vat_quote_source()
    imported = _collect_imports(source)
    offenders = imported & _FORBIDDEN_MODULES
    assert not offenders, (
        f"app.vat_quote imports forbidden module(s): {sorted(offenders)}. "
        "This would contradict the unauthenticated access-control decision."
    )


def test_ac7_module_does_not_use_open_builtin():
    """vat_quote.py must not call open() — file I/O is incompatible with stateless design."""
    source = _get_vat_quote_source()
    tree = ast.parse(source)
    for node in ast.walk(tree):
        if isinstance(node, ast.Call):
            func = node.func
            # Bare ``open(...)`` call
            if isinstance(func, ast.Name) and func.id == "open":
                pytest.fail(
                    "app.vat_quote calls open() — file access is not "
                    "permitted in a stateless unauthenticated endpoint."
                )


def test_ac7_module_does_not_read_environment_variables():
    """vat_quote.py must not read os.environ or os.getenv — no secret injection via env."""
    source = _get_vat_quote_source()
    tree = ast.parse(source)
    for node in ast.walk(tree):
        if isinstance(node, ast.Attribute):
            # Catches ``os.environ`` and ``os.getenv``
            if isinstance(node.value, ast.Name) and node.value.id == "os":
                if node.attr in {"environ", "getenv", "environ_get"}:
                    pytest.fail(
                        f"app.vat_quote accesses os.{node.attr} — reading "
                        "environment variables is not permitted in a stateless "
                        "unauthenticated endpoint."
                    )
