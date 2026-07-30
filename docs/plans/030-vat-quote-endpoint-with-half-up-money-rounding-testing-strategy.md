# Testing Strategy — VAT Quote Endpoint with Half-Up Money Rounding

**Feature:** VAT quote endpoint with half-up money rounding  
**Endpoint:** `POST /api/quote`  
**Date:** 2026-07-30

---

## 1. Overview

This document defines the testing strategy for the `POST /api/quote` endpoint.  
It maps every acceptance criterion (AC1–AC7) to one or more test approaches,
declares coverage targets per lane, and records the rationale behind each choice.

The endpoint is a **pure stateless calculator**: it reads only request-body
values, performs Decimal arithmetic with half-up rounding, and returns a
five-field money response.  No database, file, or network I/O is involved.
That characteristic strongly favours unit and integration tests — a small,
targeted suite that runs fast and is determinate.

---

## 2. Test Lanes

| Lane | Tool | Location | Scope |
|------|------|----------|-------|
| **Unit** | `pytest` | `tests/test_vat_quote*.py` | Pydantic models, rounding helpers, calculation logic via `TestClient` mounted on an isolated `FastAPI` app |
| **Integration** | `pytest` | `tests/test_vat_quote*.py` | Same `TestClient` suite — the distinction is that the full request/response serialisation path (JSON → Pydantic → handler → response model → JSON) is exercised end-to-end within the process |
| **E2E** | `pytest` + live server | `tests/` (future) | The full service stack started with `uvicorn`; exercises HTTP over the network, ASGI middleware, and the router mounted in `app.main` |

> **Why unit and integration share the same files:**  
> Because the handler is stateless and has no external collaborators, a
> `TestClient`-based test simultaneously exercises the schema-validation layer
> (integration concern) **and** the arithmetic/rounding core (unit concern).
> Splitting them into separate directories would add noise without adding
> coverage value.

---

## 3. Acceptance-Criterion to Test Mapping

### AC1 — Basic VAT Calculation

> `POST /api/quote` with `{"subtotal": 100.00, "vat_rate": 0.2}` returns HTTP 200
> and a body where `net` is 100.00, `vat` is 20.00 and `total` is 120.00.

**Approach:** Integration (TestClient)  
**Test file:** `tests/test_vat_quote.py`  
**Tests:**
- `test_ac1_basic_vat_calculation` — asserts all five response fields against exact expected values.
- `test_ac1_zero_vat_rate` — boundary case: `vat_rate=0` yields `vat=0` and `total=net`.

**Rationale:** These are the canonical happy-path examples from the spec; verifying them
with exact field equality leaves no room for silent rounding drift.

---

### AC2 — Half-Up Rounding

> Every monetary value is rounded to 2 decimal places using half-up rounding
> (ties round away from zero). `subtotal=1.005, vat_rate=0` → `total=1.01`
> and `subtotal=2.675, vat_rate=0` → `total=2.68`.

**Approach:** Unit (via TestClient — arithmetic correctness is the target)  
**Test file:** `tests/test_vat_quote.py`  
**Tests:**
- `test_ac2_1_005_rounds_total_to_1_01` — spec example A.
- `test_ac2_2_675_rounds_total_to_2_68` — spec example B.
- `test_ac2_all_fields_have_exactly_two_decimal_places` — structural assertion on all five fields.
- `test_ac2_vat_rounding_half_up` — VAT field itself is rounded, not just subtotal.

**Rationale:** Python's built-in `round()` uses banker's rounding (ROUND_HALF_EVEN),
which would silently produce the wrong answer for the spec examples.  These
tests act as a regression guard if the `Decimal + ROUND_HALF_UP` implementation
is ever replaced.

---

### AC3 — Discount Applied Before VAT

> `discount_pct` is applied to `subtotal` **before** VAT is calculated.
> `{"subtotal": 100.00, "vat_rate": 0.2, "discount_pct": 10}` returns
> `discount=10.00, net=90.00, vat=18.00, total=108.00`.

**Approach:** Integration (TestClient)  
**Test file:** `tests/test_vat_quote_ac3.py`  
**Tests:**
- `test_ac3_ten_percent_discount_reduces_net` — 10% discount with zero VAT.
- `test_ac3_discount_applied_before_vat` — canonical spec example with VAT on discounted net.
- `test_ac3_zero_discount_leaves_net_equal_to_subtotal` — boundary: `discount_pct=0`.
- `test_ac3_full_discount_yields_zero_net_and_total` — boundary: `discount_pct=100`.
- `test_ac3_discount_pct_omitted_defaults_to_zero` — default-value contract.
- `test_ac3_discount_rounded_half_up_at_tie` — half-up on the discount amount itself.
- `test_ac3_discount_rounded_half_up_non_trivial` — 10.005% discount rounds to 10.01.
- `test_ac3_fractional_discount_pct` — fractional percentage produces correct discount.
- `test_ac3_ac5_net_plus_vat_equals_total_with_discount` — penny-exact total invariant holds with discount.
- `test_ac3_ac5_all_fields_two_dp_with_discount` — all fields remain 2dp when discounted.

**Rationale:** The order of operations (discount → net → VAT) is a contractual
requirement, not an implementation preference.  Multiple tests confirm the
calculation sequence independently.

---

### AC4 — Input Validation Returns 422

> A negative `subtotal`, a `vat_rate` outside 0..1, or a `discount_pct`
> outside 0..100 returns HTTP 422 and **never** a 500.

**Approach:** Integration (TestClient validation-layer tests)  
**Test files:** `tests/test_vat_quote.py`, `tests/test_vat_quote_ac4.py`  
**Tests (combined):**
- `test_ac4_negative_subtotal_returns_422` / `test_ac4_negative_subtotal_422`
- `test_ac4_zero_subtotal_is_valid` — lower-boundary value must be accepted.
- `test_ac4_vat_rate_below_zero_422`
- `test_ac4_vat_rate_exactly_zero_is_valid`
- `test_ac4_vat_rate_exactly_one_is_valid`
- `test_ac4_vat_rate_above_1_returns_422` / `test_ac4_vat_rate_above_one_422`
- `test_ac4_discount_pct_below_zero_422`
- `test_ac4_discount_pct_zero_is_valid`
- `test_ac4_discount_pct_100_is_valid`
- `test_ac4_discount_pct_above_100_returns_422` / `test_ac4_discount_pct_above_100_422`
- `test_ac4_missing_subtotal_422`
- `test_ac4_missing_vat_rate_422`
- `test_ac4_empty_body_422`

**Rationale:** Every boundary is tested on both sides (valid and invalid).  Missing
required fields are also covered because FastAPI's Pydantic integration should
reject them with 422 rather than raising an unhandled exception.

---

### AC5 — `net + vat == total` to the Penny

> For every accepted request, `net` + `vat` equals `total` to the penny.

**Approach:** Unit / property-style assertion  
**Test file:** `tests/test_vat_quote.py`  
**Tests:**
- `test_ac5_net_plus_vat_equals_total_basic` — standard case.
- `test_ac5_net_plus_vat_equals_total_rounding_edge` — at a rounding boundary.
- `test_ac3_ac5_net_plus_vat_equals_total_with_discount` (in AC3 file) — holds with discount.

**Rationale:** The implementation achieves this by computing `total = net + vat`
(both already 2dp) without re-rounding.  The tests verify this contract
explicitly so that any future refactor that introduces a separate `total`
rounding step is caught immediately.

---

### AC6 — Input Bounds and Non-Finite Rejection

> The endpoint rejects non-numeric values, NaN, ±infinity, and any `subtotal`
> above 1,000,000 with HTTP 422, and never produces a 500.

**Approach:** Integration (TestClient — raw JSON strings for non-finite values)  
**Test files:** `tests/test_vat_quote.py`, `tests/test_vat_quote_ac6.py`  
**Tests:**
- `test_ac6_subtotal_above_1000000_returns_422`
- `test_ac6_non_numeric_subtotal_returns_422`
- `test_ac6_subtotal_nan_returns_422`
- `test_ac6_subtotal_positive_infinity_returns_422`
- `test_ac6_subtotal_negative_infinity_returns_422`
- `test_ac6_vat_rate_nan_returns_422`
- `test_ac6_vat_rate_positive_infinity_returns_422`
- `test_ac6_vat_rate_negative_infinity_returns_422`
- `test_ac6_discount_pct_nan_returns_422`
- `test_ac6_discount_pct_positive_infinity_returns_422`
- `test_ac6_discount_pct_negative_infinity_returns_422`
- Sanity tests: finite boundary values remain accepted (200).

**Note on non-finite JSON:** Standard JSON does not include `NaN`/`Infinity`
literals, but Python's `json` parser accepts them.  The AC6 tests send these
as raw bytes (bypassing `httpx`'s `json=` helper) to ensure the validator
handles them cleanly.  The `_must_be_finite` field-validator returns a
sentinel string rather than raising `ValueError`, avoiding a `json.dumps`
failure on the error detail.

**Rationale:** Hostile callers can exploit non-standard JSON to probe for
uncaught exceptions.  Explicit tests for every field + every non-finite
variant (NaN, +∞, −∞) give confidence that the boundary is complete.

---

### AC7 — Access Control Decision (Intentionally Unauthenticated)

> `POST /api/quote` requires no authentication because it is a pure stateless
> calculator.  The handler MUST NOT read/write database, file, secret, or
> credential, and MUST return the same response for the same request body
> regardless of caller.

**Approach:** Static analysis (AST) + behavioural tests  
**Test file:** `tests/test_vat_quote_ac7.py`  
**Tests:**
- `test_ac7_endpoint_accessible_with_no_auth_headers` — no credentials needed for 200.
- `test_ac7_endpoint_accessible_with_empty_headers` — empty header dict still 200.
- `test_ac7_endpoint_returns_no_www_authenticate_challenge` — response carries no auth challenge.
- `test_ac7_same_body_returns_same_result_for_all_callers` — seven caller-identity header sets produce bit-for-bit identical responses.
- `test_ac7_multiple_calls_same_body_are_deterministic` — same payload → same result across calls.
- `test_ac7_request_model_has_no_caller_scoping_fields` — `QuoteRequest` contains none of 16 forbidden field names (`user_id`, `token`, etc.).
- `test_ac7_request_model_only_contains_numeric_calculation_inputs` — field set is exactly `{subtotal, vat_rate, discount_pct}`.
- `test_ac7_module_imports_no_database_or_network_library` — AST walk confirms no forbidden imports.
- `test_ac7_module_does_not_use_open_builtin` — AST walk confirms no `open()` calls.
- `test_ac7_module_does_not_read_environment_variables` — AST walk confirms no `os.environ`/`os.getenv`.

**Rationale:** The AC7 decision is a formal security boundary, not a casual
choice.  Behavioural tests prove the current behaviour; AST-based static
checks act as a lint gate that prevents the boundary from eroding silently
through future code changes.

---

## 4. Coverage Targets

| Lane | Target | Rationale |
|------|--------|-----------|
| Unit / Integration (combined `pytest`) | **≥ 95 % line coverage** on `src/app/vat_quote.py` | The file is small and purely algorithmic; every branch should be reachable |
| E2E (live-server) | Smoke only — AC1 happy path | E2E adds infra cost; full scenario coverage lives in the faster integration lane |

Run coverage locally:
```bash
pytest --cov=app.vat_quote --cov-report=term-missing tests/
```

---

## 5. Test Execution

### Local

```bash
# Install dependencies
pip install -e ".[dev]"   # or: uv sync

# Run the full suite
pytest

# Run a specific AC file
pytest tests/test_vat_quote_ac6.py -v

# Run with coverage
pytest --cov=app --cov-report=html
```

### CI

Tests are run by the CI pipeline on every push and pull-request.  See
`docs/plans/030-vat-quote-endpoint-with-half-up-money-rounding-cicd-pipeline.md`
for the pipeline definition.  The test stage:

1. Runs `pytest` with JUnit XML output for the test-result tab.
2. Publishes an HTML coverage report as a build artifact.
3. Fails the build if any test fails (the test stage gates subsequent stages).

---

## 6. Out of Scope

| Concern | Reason excluded |
|---------|----------------|
| Load / performance testing | The endpoint performs only in-process arithmetic; throughput is bounded by the ASGI server, not the handler logic |
| Fuzz testing of JSON parsing | Standard library `json` parsing is not under test; Pydantic's validator is the target, and the AC6 non-finite tests cover the only non-standard JSON vectors Python accepts |
| Authentication/authorisation flows | AC7 explicitly records that the endpoint is unauthenticated; auth tests would be vacuous |
| Contract / consumer-driven tests | No downstream consumers exist yet; add when the first consumer is onboarded |

---

## 7. Mapping Summary

| AC | Test file(s) | Approach | Status |
|----|-------------|----------|--------|
| AC1 | `test_vat_quote.py` | Integration — happy-path exact values | ✅ Implemented |
| AC2 | `test_vat_quote.py` | Unit — half-up rounding spec examples | ✅ Implemented |
| AC3 | `test_vat_quote_ac3.py` | Integration — discount-before-VAT order | ✅ Implemented |
| AC4 | `test_vat_quote.py`, `test_vat_quote_ac4.py` | Integration — boundary & missing fields | ✅ Implemented |
| AC5 | `test_vat_quote.py`, `test_vat_quote_ac3.py` | Unit — `net+vat==total` invariant | ✅ Implemented |
| AC6 | `test_vat_quote.py`, `test_vat_quote_ac6.py` | Integration — non-finite & out-of-bounds | ✅ Implemented |
| AC7 | `test_vat_quote_ac7.py` | Static + behavioural — stateless guarantee | ✅ Implemented |
