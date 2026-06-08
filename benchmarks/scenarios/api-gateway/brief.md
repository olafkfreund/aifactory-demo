# Scenario 1 — FastAPI API gateway with rate limiting

A small HTTP API gateway service in **Python (FastAPI)**, built into
`scenarios/api-gateway/` on branch `bench/api-gateway`.

## Goal

A single FastAPI app that exposes health/echo endpoints and a fixed-window
rate limiter, suitable as a minimal edge gateway.

## Scope

- `GET /healthz` — liveness, returns `{"status": "ok"}` (200).
- `GET /echo?msg=...` — returns `{"echo": "<msg>"}`; missing `msg` → 422.
- A fixed-window **rate limiter** (per client IP) applied to `/echo`.
- Config via env: `RATE_LIMIT_MAX` (default 5), `RATE_LIMIT_WINDOW_SECONDS` (default 1).

## Acceptance Criteria

- AC#1: `GET /healthz` returns 200 with body `{"status": "ok"}`.
- AC#2: `GET /echo?msg=hi` returns 200 with body `{"echo": "hi"}`.
- AC#3: `GET /echo` with no `msg` query param returns 422.
- AC#4: When more than `RATE_LIMIT_MAX` requests arrive from the same client within
  one window, the next request returns **429**, and the 429 response MUST include
  an integer **`Retry-After`** header (whole seconds until the window resets).
- AC#5: After the window elapses, the same client can call `/echo` again (200).
- AC#6: `pytest` passes; the rate-limit behaviour (AC#4, AC#5) is covered by tests.

## Out of scope

- Auth, upstream proxying, TLS, persistence.

## Notes for the pipeline

- Verify lane(s): `unit`, `api`.
- AC#4's `Retry-After` requirement is intentionally precise — a first build that
  returns 429 without the header should trigger a TFactory → AIFactory handback.
