# Testing Strategy — Invoice Line-Total Endpoint

> Plan ID: 034  
> Feature: `POST /api/line-total`  
> Service: aifactory-demo (FastAPI, Python 3.10+)

---

## 1. Scope

This document describes the testing strategy for the `POST /api/line-total` endpoint
introduced in task 108.  It covers all six acceptance criteria (AC1–AC6), maps each
to a test lane, and defines coverage targets.

---

## 2. Test Lanes

| Lane | Purpose | Location | Runner |
|------|---------|----------|--------|
| **Unit** | Pure arithmetic helpers; Decimal rounding correctness | `tests/test_line_total.py` | `pytest` |
| **Integration** | Full HTTP request/response via FastAPI TestClient | `tests/test_line_total.py` | `pytest` |
| **E2E** | Live-server smoke test via HTTP against a running process | CI step (see §6) | `curl` / `httpx` script |

The endpoint is a **stateless pure calculator** with no database, file or outbound
network dependencies.  Integration tests therefore cover the same surface as E2E
tests for correctness; the E2E step is limited to a start-up smoke test.

---

## 3. Acceptance-Criteria-to-Test Mapping

### AC1 — Happy-path response

> `POST /api/line-total` with `{"unit_price": 10.00, "quantity": 3, "vat_rate": 0.2}`  
> returns HTTP 200 and `{"net": 30.00, "vat": 6.00, "total": 36.00}`.

**Lane:** Integration  
**Tests:**
- `TestAC1HappyPath::test_ac1_standard_values` — verifies status 200 and exact field values.
- `TestAC1HappyPath::test_response_fields_present` — response body contains exactly `net`, `vat`, `total`.
- `TestAC1HappyPath::test_response_values_have_two_decimal_places` — values are rounded to 2 dp.

---

### AC2 — Arithmetic definition and total consistency

> `net = half-up round(unit_price × quantity, 2)`  
> `vat = half-up round(net × vat_rate, 2)`  
> `total = net + vat` (exact, never rounded again)  
> `total` MUST equal `net + vat` to the penny for every accepted request.

**Lane:** Unit + Integration  
**Tests:**
- `TestHalfUp::*` — unit tests for the `_half_up(Decimal)` helper covering exact, round-down, round-up, half-up tie, negative, zero.
- `TestArithmetic::test_ac1_values`, `test_ac3_values`, `test_total_always_equals_net_plus_vat` — unit verification of the three-step formula.
- `TestArithmetic::test_uses_half_up_not_half_even` — distinguishes half-up from Python's built-in `round()` (which uses banker's rounding / half-even).
- `TestAC2ArithmeticAndTotalConsistency::test_total_equals_net_plus_vat` (parametrized, 7 cases) — integration assertion that `body["net"] + body["vat"] == body["total"]` at the HTTP level.
- `TestAC2ArithmeticAndTotalConsistency::test_half_up_rounding_not_half_even` — regression guard.

---

### AC3 — Specific rounding case (vat_rate = 0.175)

> `{"unit_price": 10.00, "quantity": 1, "vat_rate": 0.175}` →  
> `net: 10.00, vat: 1.75, total: 11.75`

**Lane:** Unit + Integration  
**Note on spec:** The published spec states `total: 11.76`, but per AC2  
(`total = net + vat = 10.00 + 1.75 = 11.75`) this is a typographical error.  
The implementation follows AC2.  Tests assert `11.75`.

**Tests:**
- `TestArithmetic::test_ac3_values` — unit arithmetic check.
- `TestAC3SpecificRounding::test_ac3_values` — integration HTTP check.
- `TestAC3SpecificRounding::test_ac3_total_equals_net_plus_vat` — consistency invariant.

---

### AC4 — Invalid business inputs → HTTP 422

> Negative `unit_price`, `quantity < 1`, or `vat_rate` outside `[0, 1]` must return  
> HTTP 422 and never HTTP 500.

**Lane:** Integration  
**Tests:**
- `TestAC4InvalidInputs::test_negative_unit_price_returns_422`
- `TestAC4InvalidInputs::test_zero_unit_price_returns_422`
- `TestAC4InvalidInputs::test_quantity_zero_returns_422`
- `TestAC4InvalidInputs::test_quantity_negative_returns_422`
- `TestAC4InvalidInputs::test_vat_rate_negative_returns_422`
- `TestAC4InvalidInputs::test_vat_rate_above_one_returns_422`
- `TestAC4InvalidInputs::test_invalid_inputs_never_produce_500` — exhaustive no-500 assertion.

Boundary acceptance tests:
- `TestAC4InvalidInputs::test_vat_rate_zero_is_valid` (vat_rate=0 is inclusive lower bound → 200)
- `TestAC4InvalidInputs::test_vat_rate_one_is_valid` (vat_rate=1 is inclusive upper bound → 200)

---

### AC5 — Hostile-input bounds and non-numeric rejection → HTTP 422

> Reject non-numeric values, NaN, Infinity, `quantity > 10000`, `unit_price > 1000000`  
> with HTTP 422; no unhandled server error.

**Lane:** Integration  
**Tests:**
- `TestAC5BoundsAndNonNumeric::test_non_numeric_unit_price_returns_422` — string value.
- `TestAC5BoundsAndNonNumeric::test_non_numeric_quantity_returns_422`
- `TestAC5BoundsAndNonNumeric::test_non_numeric_vat_rate_returns_422`
- `TestAC5BoundsAndNonNumeric::test_missing_field_returns_422`
- `TestAC5BoundsAndNonNumeric::test_null_field_returns_422`
- `TestAC5BoundsAndNonNumeric::test_quantity_above_10000_returns_422`
- `TestAC5BoundsAndNonNumeric::test_quantity_at_10000_is_valid` (boundary → 200)
- `TestAC5BoundsAndNonNumeric::test_unit_price_above_1000000_returns_422`
- `TestAC5BoundsAndNonNumeric::test_unit_price_at_1000000_is_valid` (boundary → 200)
- `TestAC5BoundsAndNonNumeric::test_empty_body_returns_422`
- `TestAC5BoundsAndNonNumeric::test_extra_fields_are_ignored`

**Note on NaN/Infinity:** `NaN` and `Infinity` are not valid JSON literals; the
stdlib JSON parser rejects them before Pydantic validation.  The `_reject_non_finite`
field validator in `LineTotalRequest` provides defence-in-depth if the value enters
through a non-JSON path.

---

### AC6 — Access control: intentionally unauthenticated; pure stateless

> No authorization check; handler MUST NOT read/write any DB, file, secret or
> credential; MUST return the same response for the same body regardless of caller.

**Lane:** Integration  
**Tests:**
- `TestAC6AccessControlAndStatelessness::test_no_auth_header_required` — 200 without any `Authorization` header.
- `TestAC6AccessControlAndStatelessness::test_same_body_returns_same_response` — identical bodies → identical responses.
- `TestAC6AccessControlAndStatelessness::test_repeated_calls_are_consistent` — 5 consecutive calls return the same result.
- `TestAC6AccessControlAndStatelessness::test_different_bodies_give_independent_results` — responses are not cross-contaminated.
- `TestAC6AccessControlAndStatelessness::test_content_type_json_required`

**Static verification:** Code review confirms the handler calls no external services,
reads no environment variables, and writes no persistent state.

---

## 4. Coverage Targets

| Lane | Target | Approach |
|------|--------|----------|
| Unit | 100 % of `_half_up` and arithmetic logic | Explicit branch tests |
| Integration | ≥ 90 % statement coverage on `src/app/main.py::api_line_total` | `pytest --cov=app` |
| E2E | Start-up smoke: 1 request returns 200 | CI post-deploy step |

Run coverage locally:

```bash
pip install pytest pytest-cov httpx
pytest --cov=app --cov-report=term-missing
```

---

## 5. Out of Scope

- **Load / performance testing** — the endpoint is a pure CPU-bound calculation with
  negligible latency; benchmarking is delegated to future capacity planning.
- **Security scanning** — handled by the CI/CD pipeline (CICD subtask).
- **Contract testing** — no downstream consumers registered yet; add Pact tests when
  a consumer onboards.

---

## 6. E2E Smoke-Test Procedure

Run after every deployment to verify the service started correctly:

```bash
# Start the service (example)
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
sleep 2

# Smoke test (requires httpie or curl)
curl -s -X POST http://localhost:8000/api/line-total \
  -H "Content-Type: application/json" \
  -d '{"unit_price": 10.00, "quantity": 3, "vat_rate": 0.2}' | \
  python -c "
import sys, json
body = json.load(sys.stdin)
assert body['net']   == 30.00, f'net mismatch: {body}'
assert body['vat']   ==  6.00, f'vat mismatch: {body}'
assert body['total'] == 36.00, f'total mismatch: {body}'
print('E2E smoke test PASSED')
"
```

This procedure is wired into the CI/CD deploy stage
(see `docs/plans/034-invoice-line-total-endpoint-cicd-pipeline.md`).

---

## 7. Rollback Criteria

Roll back the deployment if any of the following is observed in production:

- `POST /api/line-total` returns HTTP 5xx on a valid payload.
- `total` ≠ `net + vat` in any response.
- Response time p99 > 500 ms under normal load.

---

*Generated: 2026-07-30 — aifactory task 108, subtask TEST*
