# PARR benchmark results — Claude config (#28)

The full scenario matrix from `benchmarks/scenarios.yaml` run end-to-end through
the live Factory PARR pipeline (PFactory plan -> AIFactory code -> TFactory
verify -> CFactory observe), threaded per scenario by its GitHub epic
(the RFC-0001 `correlation_key`). Provider config: **Claude** (planning +
coding + QA on `claude-sonnet-4-6`; the factory default). Raw per-run output is
the sibling `<slug>.json` file.

_Runs captured 2026-06-13 .. 2026-06-20 against the live `factory` cluster._

## Leaderboard

| Scenario | Lang | Plan | Code | Verify | Handbacks | Tokens | Cost (USD) | Overall |
|---|---|---|---|---|---|---|---|---|
| api-gateway | Python | passed (54.5s) | passed (1635.4s) | passed (1501.2s) | 0 | 2,576,651 | 1.5108 | **passed** |
| rust-hello | Rust | passed (45.5s) | passed (2070.6s) | passed (1425.9s) | 0 | 7,602,717 | 5.0470 | **passed** |
| aws-3tier | TypeScript | error (7.8s) | passed (4633.4s) | failed (1862.5s) | 0 | 9,468,438 | 7.3515 | failed |
| go-hello | Go | error (15.0s) | — | skipped | 0 | 0 | 0.0000 | failed |

Two scenarios close the full plan -> code -> verify loop green with **zero
handbacks**. The other two fail for two different, fully-diagnosed reasons (below)
— neither is a spine defect.

## Method (reproducible)

The orchestrator is `scripts/run_benchmark.py`; the scenario set is
`benchmarks/scenarios.yaml`. Each scenario:

1. **plan** — POST the brief (`scenarios/<slug>/brief.md`) to PFactory, which
   signs a contract and opens the epic (the `correlation_key`).
2. **code** — AIFactory builds the trusted plan into `scenarios/<slug>/` on
   branch `bench/<slug>`; the stage passes only when the build reports
   `tokens > 0` and reaches a terminal non-running state.
3. **verify** — TFactory generates + runs the lane suite for the scenario's
   `verify_level`; the stage takes TFactory's verdict.

Per-run metrics (`<slug>.json`): stage wall-clock, RFC-0001 v1.1 token/cost
rollups, and handback count. The matrix was driven **inside the aifactory pod**
(the only host with cluster egress) against the in-cluster service endpoints;
`run_benchmark.py --all --dry-run` prints the exact REST flow first and makes no
calls. See `benchmarks/README.md` for the full runbook.

## Per-scenario notes

### api-gateway (Python) — passed
FastAPI gateway with rate limiting. Plan -> code -> verify all green, 0
handbacks, ~53 min wall-clock to a verified branch, 2.58M tokens / $1.51.

### rust-hello (Rust) — passed
Greeting library + CLI, `cargo test`. Plan -> code -> verify all green, 0
handbacks, ~59 min wall-clock, 7.60M tokens / $5.05. Confirms the spine is
language-agnostic across a compiled, non-Python toolchain.

### aws-3tier (TypeScript) — built, verify failed
A 3-tier URL shortener (web + Postgres + Redis) on AWS EKS — the hardest
scenario. The **code stage passed**: AIFactory produced the full build (9.47M
tokens, ~77 min). The plan stage shows `HTTP 409 Conflict` because the epic
already existed from an earlier attempt — the harness reused it and proceeded
(idempotency gap tracked in PFactory#119). **Verify failed**: TFactory's
generated `unit` + `api` + `integration` suite returned a `failed` verdict
against the build. This is a genuine quality signal on the most complex
scenario, not a pipeline error — the loop ran end-to-end and the verify leg did
its job (rejected an insufficient build rather than passing it).

### go-hello (Go) — no clean run; blocked on Go support
Go is the one unsupported language in the matrix: **TFactory has no Go
test-generation framework** (registry has pytest/jest/cargo/vitest/etc., no
`gotest`), so a Go spec falls back to Python pytest and dead-ends at
`triaged_empty`. Tracked in **TFactory#443** (add a Go framework descriptor +
runner image + planner language-routing). The last recorded attempt
(`go-hello.json`) additionally aborted early at the harness layer
(plan: connection-refused, code: 401) before reaching the pipeline, so it is not
a representative run — it is retained only as the most recent raw artifact.
go-hello stays **failed/blocked** until #443 lands.

## Headline numbers (for the blog + pitch kit)

- **2 / 4 scenarios fully green** (Python + Rust) end-to-end through plan ->
  code -> verify with **0 handbacks**.
- **~53–59 min** wall-clock from brief to verified branch on the green runs.
- **$1.51 (Python) / $5.05 (Rust)** total token cost per fully-verified build.
- The verify leg **caught a failing build** (aws-3tier) rather than rubber-
  stamping it — the differentiating half of the pipeline working as designed.
- One transparent capability gap (Go test-gen, TFactory#443) — recorded, not
  hidden.
