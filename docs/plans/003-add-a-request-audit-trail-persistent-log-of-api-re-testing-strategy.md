# Testing Strategy — Request-Audit Trail

> Feature: **Add a request-audit trail: persistent log of API requests with query endpoint**
> Scope: the `src/app/audit` package — the recording middleware, the persistent
> SQLite store, the `GET /api/audit` query endpoint and its client-key auth.

This document is the authoritative testing plan for the audit-trail feature. It
maps every plan acceptance criterion to a concrete test approach, defines the
test lanes and how they run, and records the coverage targets each lane is held
to. Test generation is handed to TFactory; the layout and expectations below are
what generated (and hand-written) tests must satisfy.

---

## 1. Test lanes

| Lane | Purpose | Where | Runner |
| --- | --- | --- | --- |
| **Unit** | Exercise a single component in isolation with no HTTP stack. | `tests/test_audit_store.py`, `tests/test_audit_auth.py` | `pytest` |
| **Integration** | Exercise the wired FastAPI app (middleware + router + store) via an ASGI `TestClient`. | `tests/test_audit_api.py` | `pytest` |
| **E2E** | Exercise the request → record → query round trip against a booted app and an on-disk database, including persistence across a simulated restart. | `tests/test_audit_api.py` (`TestClient` context manager) + `tests/test_audit_store.py` (restart case) | `pytest` |

All three lanes run under a single `pytest` invocation. They are separated by
intent and file, not by a separate runner, keeping the suite fast and CI wiring
trivial (`pytest` is the only command needed to gate the build).

### Shared fixtures (`tests/conftest.py`)

- `db_path` — a per-test temporary SQLite path (`tmp_path`), guaranteeing isolation.
- `store` — an isolated `SQLiteAuditStore`, closed on teardown.
- `build_app` / `app_factory` — builds a FastAPI app wired with `AuditMiddleware`
  and the audit `router`, both bound to the same store, plus a handful of
  exerciseable routes (`/api/things`, `/api/widgets`, `/api/missing` → 404,
  `/api/broken` → 500).
- `client` — a `TestClient` over that app (used as a context manager so ASGI
  startup/shutdown run, giving the E2E round trip).
- `auth_headers` — headers carrying a valid client key so AC6-guarded reads succeed.

The app overrides the auth allowlist (`get_valid_client_keys`) to a single known
key so authentication is exercised deterministically without env-var coupling.

---

## 2. Acceptance-criterion → test mapping

Every acceptance criterion maps to at least one passing test.

### AC1 — one audit record per handled request (method, path, status, latency, client key)

- **Lane:** integration.
- **Tests:** `tests/test_audit_api.py`
  - `test_request_creates_exactly_one_record` — asserts a single record with the
    correct method, path, status code, client key, non-negative latency and a
    populated timestamp.
  - `test_each_request_records_once` — three requests ⇒ exactly three records.
  - `test_records_method_and_status_for_writes` — `POST` ⇒ `201` captured.
  - `test_client_key_is_null_when_header_absent` — missing `x-client-key` stored as `None`.
  - `test_error_responses_are_recorded` — 404 and 500 responses are still recorded.

### AC2 — records persist across process restarts

- **Lane:** unit / e2e.
- **Tests:** `tests/test_audit_store.py`
  - `test_records_persist_across_restart` — a store writes to a file, is closed,
    and a **new** store object opened on the same path still reads every record
    (a simulated restart).
  - Supporting round-trip: `test_append_assigns_id_and_persists_all_fields`,
    `test_append_autoincrements_ids`.

### AC3 — `GET /api/audit` filtering + pagination

- **Lane:** unit (store query) + integration (endpoint).
- **Store unit tests** (`tests/test_audit_store.py`):
  - `test_query_returns_newest_first`
  - `test_query_filters_by_path_prefix` and `test_path_prefix_treats_wildcards_literally`
    (SQL `LIKE` wildcards are treated literally).
  - `test_query_filters_by_status_class` (2xx/4xx/5xx, enum and string forms).
  - `test_query_filters_by_time_range_inclusive` (from-only, to-only, both — inclusive bounds).
  - `test_query_limit_and_offset_paginate` and `test_query_combines_filters`.
- **Endpoint integration tests** (`tests/test_audit_api.py`):
  - `test_endpoint_returns_records_newest_first`
  - `test_endpoint_filters_by_path_prefix`
  - `test_endpoint_filters_by_status_class` and `test_endpoint_rejects_invalid_status_class` (422)
  - `test_endpoint_filters_by_time_range`
  - `test_endpoint_paginates_with_limit_and_offset` (disjoint, ordered pages)
  - `test_endpoint_rejects_out_of_range_limit` (negative and over-max ⇒ 422)

### AC4 — audit endpoint excluded from recording (no self-amplification)

- **Lane:** unit + integration.
- **Tests:** `tests/test_audit_api.py`
  - `test_audit_endpoint_is_not_recorded` — repeated reads of `/api/audit` add zero records.
  - `test_self_exclusion_does_not_suppress_other_paths` — non-audit paths are still recorded.
  - `test_is_excluded_path_matches_only_the_audit_endpoint` — exact/sub-path match,
    but `/api/auditors` (shared textual prefix) is **not** excluded.

### AC5 — tests cover creation, persistence, each filter, self-exclusion; pytest green

- Satisfied by the union of the AC1–AC4 tests above. The full suite (currently
  **50 tests**) runs green under `pytest` and is the gate for this criterion.

### AC6 — client-key authentication on `GET /api/audit`

- **Lane:** unit (auth helpers) + integration (HTTP enforcement).
- **Auth unit tests** (`tests/test_audit_auth.py`):
  - `test_require_client_key_returns_valid_key`
  - `test_require_client_key_rejects_missing_key` / `_rejects_empty_key` → 401
  - `test_require_client_key_rejects_unknown_key` / `_rejects_when_no_keys_configured` → 403 (fails closed)
  - `test_parse_keys_splits_and_trims`, `test_parse_keys_handles_empty_and_none`
  - `test_get_valid_client_keys_reads_environment`, `test_get_valid_client_keys_defaults_empty`
- **Endpoint integration tests** (`tests/test_audit_api.py`):
  - `test_audit_endpoint_rejects_missing_client_key` → 401, no `items` in body.
  - `test_audit_endpoint_rejects_invalid_client_key` → 403, no `items` in body.
  - `test_audit_endpoint_allows_valid_client_key` → 200 with records.
  - `test_audit_records_never_exposed_unauthenticated` — neither a missing nor an
    invalid key leaks any record payload (checks body and raw text).

---

## 3. Coverage targets

| Lane | Target | Notes |
| --- | --- | --- |
| Unit | ≥ 90% line coverage of `store.py`, `auth.py`, `models.py` | Pure logic with no I/O boundaries beyond SQLite; high coverage is cheap. |
| Integration | ≥ 90% line coverage of `middleware.py`, `api.py` | The defensive `except` in the middleware (best-effort auditing) is marked `# pragma: no cover` and explicitly waived. |
| E2E | Behavioural, not line-coverage gated | The restart-persistence and authenticated round-trip paths are the acceptance signal; no numeric target. |
| **Overall** | ≥ 90% for the `src/app/audit` package | Enforced in CI via `pytest --cov=src/app/audit` once coverage tooling is wired by the CICD subtask. |

**Explicit waivers**

- `middleware.py` — the `except Exception` branch that logs and swallows store
  failures (auditing must never break the observed request) is `# pragma: no cover`.
- `conftest.py` demo routes are marked `# pragma: no cover - trivial`.

---

## 4. Running the tests

Local:

```bash
uv pip install -e '.[test]'   # fastapi, uvicorn, pytest, httpx
pytest                        # runs unit + integration + e2e lanes
```

Verification command for this subtask:

```bash
pytest
```

Expected: all tests pass (currently `50 passed`).

## 5. CI integration

Tests run in CI and gate the build. The CICD pipeline (see the companion
`003-...-cicd-pipeline.md`) runs the suite in the **test** stage after **lint**
and before **build**; a red suite fails the pipeline and blocks deploy. Coverage
is published from the same stage via `pytest --cov=src/app/audit`. No lane is
skipped in CI — the single `pytest` command covers all three lanes.
