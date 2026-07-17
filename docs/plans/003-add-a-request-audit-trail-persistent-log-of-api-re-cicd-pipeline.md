# CI/CD Pipeline — Request-Audit Trail

> Feature: **Add a request-audit trail: persistent log of API requests with query endpoint**
> Scope: the delivery pipeline that lints, tests, builds, scans and deploys the
> `aifactory-demo` FastAPI service (including the `src/app/audit` package added by
> this feature).

This document is the authoritative CI/CD plan for the audit-trail feature. It
defines the pipeline stages, what each gate enforces, and how deploys are
promoted and rolled back. It is the companion to the testing strategy in
`003-add-a-request-audit-trail-persistent-log-of-api-re-testing-strategy.md`: the
**test** stage below runs exactly the suite described there.

---

## 1. Pipeline overview

The pipeline runs on **every push and every pull request** and is a strict,
fail-fast sequence:

```
lint  →  test  →  build  →  security scan  →  deploy (gated + manual approval)
```

Each stage must be green for the next to start. The first four stages
(`lint`, `test`, `build`, `security scan`) run on every push and PR and never
deploy. The `deploy` stages run only after a green build and only with a manual
approval.

| Stage | Purpose | Runs on | Blocks on failure |
| --- | --- | --- | --- |
| **lint** | Static checks / formatting / style. | push + PR | yes |
| **test** | Full `pytest` suite + coverage report. | push + PR | yes |
| **build** | Produce a runnable artifact (wheel + container image). | push + PR | yes |
| **security scan** | Dependency + source vulnerability scan. | push + PR | yes |
| **deploy (staging)** | Roll out the built image to staging. | main, gated | yes |
| **deploy (production)** | Promote to production. | manual approval | yes |

### Runtime & toolchain

The service is Python 3.10+ / FastAPI, managed with **uv**. Dependencies are
declared in `pyproject.toml` (`fastapi`, `uvicorn`; `test` extra pins `pytest`,
`httpx`). The Node manifest (`package.json`) and `go.mod` declare auxiliary
tooling runtimes only — the deployable service is the Python app.

Required commands (see `required_commands` in the implementation plan):
`uv`, `ruff`, `pytest`.

---

## 2. Stages

### 2.1 Lint

Static analysis gate. Runs `ruff` over the repository:

```bash
uv tool run ruff check .
uv tool run ruff format --check .
```

- Fails the pipeline on any lint or formatting violation.
- Fast (< 5s); runs first so obvious issues fail before the heavier stages.

### 2.2 Test

Runs the **entire** suite described in the testing strategy — unit, integration
and e2e lanes — under a single `pytest` invocation, and publishes a coverage
report:

```bash
uv pip install -e '.[test]'
pytest --cov=src/app/audit --cov-report=term-missing --cov-report=xml
```

- Runs the full suite (currently **50 tests**) on every push and PR.
- Publishes coverage as `coverage.xml` (uploaded as a build artifact and, where
  a coverage service is configured, pushed to it). The audit package target is
  **≥ 90%** line coverage, matching the testing strategy.
- A red suite fails the pipeline and blocks `build`, `security scan` and every
  deploy — tests gate the build.

### 2.3 Build

Produces the runnable artifacts once lint and test are green:

```bash
# Python wheel (hatchling build backend)
uv build

# Container image
docker build -t aifactory-demo:${GIT_SHA} .
```

- The wheel packages `src/app` (per `[tool.hatch.build.targets.wheel]`).
- The container image is the deployable artifact; it is tagged with the commit
  SHA so every deploy is traceable to a build.
- The image runs the app via `uvicorn app.main:app` and exposes the
  `GET /health` health-check used by the platform's readiness probe.

### 2.4 Security scan

Runs after a successful build so the exact shipped artifact is scanned:

```bash
# Dependency vulnerabilities (Python)
uv tool run pip-audit

# Image / filesystem vulnerabilities
trivy image aifactory-demo:${GIT_SHA}
```

- Scans declared dependencies (`pyproject.toml`) and the built image.
- High/critical findings fail the pipeline and block deploy.
- Results are published as a scan report artifact on every push and PR.

### 2.5 Deploy (gated + manual approval)

Deploys are **gated on a green build** (lint + test + build + security scan all
passing) and **require manual approval**.

1. **Staging** — on a green build of the default branch, the SHA-tagged image is
   rolled out to staging automatically once the gate is satisfied. A post-deploy
   smoke check hits `GET /health` and a read of `GET /api/audit` (with a valid
   client key) to confirm the service and the new audit endpoint are live.
2. **Production** — promotion of the same, already-scanned image requires an
   explicit **manual approval** in the pipeline. No production rollout happens
   without a human approving the gated build.

Only artifacts that passed every prior stage are eligible; production always
promotes the identical image that staging validated (no rebuild between
environments).

---

## 3. Rollback

A rollback path is defined for every deploy:

- **Revert the rollout.** Deploys are versioned by immutable SHA-tagged images.
  Rolling back re-points the environment at the **previous** image tag — the
  last known-green revision — with no rebuild.
- **Revert the change.** Reverting the offending commit re-runs the full
  pipeline and produces a fresh green artifact.
- The staging smoke check (`GET /health` + authenticated `GET /api/audit`) is
  the signal that gates promotion; a failed smoke check aborts the deploy before
  production is touched.

Because the audit store is file/SQLite-backed and append-only, rolling the
application image back does not discard already-persisted audit records.

---

## 4. Acceptance-criterion mapping

| CICD acceptance criterion | Where satisfied |
| --- | --- |
| Lint, test, build and security-scan stages run on every push and PR. | §1 overview, §2.1–§2.4 — the four stages are push+PR triggered and fail-fast. |
| The test stage runs the full suite and publishes a coverage report. | §2.2 — `pytest --cov=src/app/audit` runs all lanes and emits `coverage.xml`. |
| Deploy stages are gated on a green build and require manual approval. | §2.5 — deploys require all prior stages green; production requires manual approval. |

---

## 5. Local reproduction

The full pipeline can be reproduced locally before pushing:

```bash
uv tool run ruff check .          # lint
uv pip install -e '.[test]'
pytest --cov=src/app/audit        # test + coverage
uv build                          # build (wheel)
uv tool run pip-audit             # security scan (dependencies)
```

Verification command for this subtask:

```bash
ruff check . && pytest
```

Expected: lint clean and all tests pass (currently `50 passed`).
