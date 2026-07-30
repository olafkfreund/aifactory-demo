# CI/CD Pipeline — Invoice Line-Total Endpoint

> Plan ID: 034  
> Feature: `POST /api/line-total`  
> Service: aifactory-demo (FastAPI, Python 3.10+)

---

## 1. Scope

This document specifies the CI/CD pipeline for the `POST /api/line-total` endpoint
introduced in task 108.  It covers all five pipeline stages (lint → test → build →
security scan → deploy), defines gate conditions, and documents the rollback path.

The pipeline runs on GitHub Actions.  Every push and every pull-request triggers the
full lint → test → build → security-scan chain.  The deploy stage is only available
on commits to `main` **and** requires a manual-approval gate before it executes.

---

## 2. Pipeline Overview

```
┌──────┐     ┌──────┐     ┌───────┐     ┌──────────────────┐     ┌────────┐
│ Lint │────▶│ Test │────▶│ Build │────▶│  Security Scan   │────▶│ Deploy │
└──────┘     └──────┘     └───────┘     └──────────────────┘     └────────┘
                 │                                                     │
                 └── coverage report published                         └── manual approval required
```

| Stage | Trigger | Blocks next stage? |
|-------|---------|-------------------|
| Lint | Every push / PR | Yes |
| Test | Every push / PR | Yes |
| Build | Every push / PR | Yes |
| Security Scan | Every push / PR | Yes |
| Deploy | `main` branch only | N/A (terminal stage) |

---

## 3. Stage Definitions

### 3.1 Lint

**Purpose:** Enforce code style and catch obvious errors before tests run.

**Tools:**
- `ruff check .` — fast Python linter covering PEP 8, unused imports, undefined names,
  and a wide set of bug-pattern rules.  Configuration lives in `pyproject.toml`
  under `[tool.ruff]`.
- `ruff format --check .` — enforces consistent formatting (a zero-diff check; fails
  if any file would be reformatted).

**Pass condition:** Both commands exit `0`.  Any lint error or formatting deviation
fails the stage and blocks the test stage.

**Rationale:** The `/api/line-total` handler is pure Python with no external I/O.
A linting gate catches dead-code and style drift at negligible cost.

---

### 3.2 Test

**Purpose:** Run the full test suite, enforce coverage thresholds, and publish a
coverage report.

**Tools:**
- `pytest` — test runner.
- `pytest-cov` — coverage measurement via `--cov=app --cov-report=xml:coverage.xml`.
- Coverage XML is uploaded as a GitHub Actions artifact (`coverage-report`) and
  optionally to a coverage service (e.g. Codecov) for PR annotations.

**Coverage targets** (from `034-invoice-line-total-endpoint-testing-strategy.md`):

| Lane | Target |
|------|--------|
| Unit (`_half_up`, arithmetic) | 100 % |
| Integration (`api_line_total` handler) | ≥ 90 % statement |
| E2E smoke | 1 passing request |

**Pass condition:** All tests pass and the integration coverage threshold is met.
The `--cov-fail-under=90` flag enforces the integration target.

**Run command:**

```bash
pytest -q --cov=app --cov-report=term-missing --cov-report=xml:coverage.xml \
       --cov-fail-under=90
```

**Artifacts published:**
- `coverage.xml` — consumed by the security-scan stage and coverage services.
- JUnit XML (`--junitxml=test-results.xml`) — surfaced as test annotations in the
  GitHub UI.

---

### 3.3 Build

**Purpose:** Produce a deployable artifact and verify the service starts cleanly.

**Artifact type:** Python wheel (built with `hatchling`).

**Steps:**

1. `pip install build && python -m build --wheel` — produces
   `dist/aifactory_demo-*.whl`.
2. Install the wheel into a fresh environment and start uvicorn in the background:
   ```bash
   pip install dist/aifactory_demo-*.whl uvicorn[standard]
   uvicorn app.main:app --host 127.0.0.1 --port 8000 &
   sleep 2
   curl -sf http://127.0.0.1:8000/healthz | grep -q '"status":"ok"'
   ```
3. The wheel is uploaded as a GitHub Actions artifact (`dist-wheel`) so it can be
   promoted to staging/production without rebuilding.

**Pass condition:** The wheel builds without error, the service starts, and
`GET /healthz` returns `{"status": "ok"}`.

---

### 3.4 Security Scan

**Purpose:** Surface known vulnerabilities in Python dependencies and flag secrets
accidentally committed to the repository.

**Tools:**

| Tool | What it checks | Command |
|------|---------------|---------|
| `pip-audit` | CVEs in installed Python packages | `pip-audit --requirement requirements-lock.txt` |
| `bandit` | Common Python security anti-patterns | `bandit -r src/` |
| `trufflescan` / `gitleaks` | Secrets accidentally committed | `gitleaks detect --source .` |

**Pass condition:** No HIGH or CRITICAL CVEs, no bandit HIGH findings, and no
credential patterns detected.  MEDIUM/LOW CVE findings produce a warning annotation
but do not block the build.

**Note:** The `POST /api/line-total` handler contains no credentials, makes no
outbound network calls, and reads no environment secrets (AC5, AC6), so the expected
output of the security scan for this endpoint is clean.

---

### 3.5 Deploy

**Purpose:** Ship the wheel produced in the build stage to the target environment.

**Trigger:** `main` branch only, after all preceding stages pass, and after a
**manual approval** is granted in the GitHub Actions environment gate.

**Environments:**

| Environment | Approval required | URL |
|-------------|-----------------|-----|
| `staging` | No (auto-deploy on merge to `main`) | `https://staging.example.com` |
| `production` | Yes — at least 1 reviewer in the `production-approvers` GitHub team | `https://api.example.com` |

**Deploy steps:**

1. Download the `dist-wheel` artifact from the build stage.
2. Install to the target host via the configured deployment mechanism
   (e.g., SSH + systemd, Kubernetes rolling update, or cloud run deploy).
3. Run the E2E smoke test against the live URL (see §4).
4. If the smoke test fails, trigger the automatic rollback procedure (see §5).

---

## 4. E2E Smoke Test (Post-Deploy)

After every deploy, the pipeline runs a smoke test against the live service to
confirm the endpoint is reachable and returns correct values:

```bash
SMOKE_URL="${DEPLOY_URL}/api/line-total"

response=$(curl -s -X POST "$SMOKE_URL" \
  -H "Content-Type: application/json" \
  -d '{"unit_price": 10.00, "quantity": 3, "vat_rate": 0.2}')

python - <<'EOF'
import sys, json
body = json.loads("""$response""")
assert body["net"]   == 30.00, f"net mismatch: {body}"
assert body["vat"]   ==  6.00, f"vat mismatch: {body}"
assert body["total"] == 36.00, f"total mismatch: {body}"
print("E2E smoke test PASSED")
EOF
```

**Pass condition:** HTTP 200 and the assertion block exits 0.

---

## 5. Rollback Path

If the post-deploy smoke test fails or a production incident is detected:

### Automatic rollback (preferred)

The deploy job keeps a reference to the **previous stable artifact tag** before
promoting.  On smoke-test failure it automatically re-deploys the previous artifact:

```bash
# Example (Kubernetes)
kubectl rollout undo deployment/aifactory-demo
kubectl rollout status deployment/aifactory-demo
```

### Manual rollback

1. Identify the last known-good wheel artifact in the `Actions → Artifacts` tab.
2. Download and re-deploy it through the same deploy mechanism used in §3.5.
3. Re-run the smoke test to confirm the rollback succeeded.

### Rollback criteria

Roll back the deployment if any of the following is observed:

- `POST /api/line-total` returns HTTP 5xx on a valid payload.
- `total` ≠ `net + vat` in any response.
- Response time p99 > 500 ms under normal load.
- Any HIGH or CRITICAL security finding introduced by the new build.

---

## 6. GitHub Actions Workflow Reference

The pipeline is implemented in `.github/workflows/ci.yml`.  The key jobs map to the
stages above:

| Job name | Stage | `needs` |
|----------|-------|---------|
| `lint` | §3.1 | — |
| `test` | §3.2 | `lint` |
| `build` | §3.3 | `test` |
| `security` | §3.4 | `build` |
| `deploy-staging` | §3.5 (staging) | `security` |
| `deploy-production` | §3.5 (production) | `deploy-staging` + manual gate |

**Minimal `ci.yml` outline:**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install ruff
      - run: ruff check .
      - run: ruff format --check .

  test:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -e '.[test]' pytest-cov
      - run: |
          pytest -q \
            --cov=app \
            --cov-report=term-missing \
            --cov-report=xml:coverage.xml \
            --junitxml=test-results.xml \
            --cov-fail-under=90
      - uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage.xml

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install build
      - run: python -m build --wheel
      - run: |
          pip install dist/aifactory_demo-*.whl "uvicorn[standard]"
          uvicorn app.main:app --host 127.0.0.1 --port 8000 &
          sleep 2
          curl -sf http://127.0.0.1:8000/healthz | grep -q '"status":"ok"'
      - uses: actions/upload-artifact@v4
        with:
          name: dist-wheel
          path: dist/

  security:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -e '.[test]' pip-audit bandit
      - run: pip-audit
      - run: bandit -r src/ -ll
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  deploy-staging:
    needs: security
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist-wheel
          path: dist/
      # Add deployment steps here (SSH, kubectl, cloud run, etc.)
      - name: E2E smoke test
        run: |
          # Replace STAGING_URL with your actual staging URL
          echo "Smoke test against staging..."

  deploy-production:
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production   # GitHub environment with required reviewers
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist-wheel
          path: dist/
      # Add production deployment steps here
      - name: E2E smoke test
        run: |
          echo "Smoke test against production..."
```

---

## 7. Acceptance Criteria Mapping

| AC | Stage(s) that enforce it |
|----|------------------------|
| Lint, test, build, and security-scan stages run on every push and PR | §3.1, §3.2, §3.3, §3.4 — all triggered on `push` and `pull_request` |
| The test stage runs the full suite and publishes a coverage report | §3.2 — `pytest --cov … --cov-report=xml` + artifact upload |
| Deploy stages are gated on a green build and require manual approval | §3.5 — `needs: security`, `environment: production` with required reviewers |

---

## 8. Out of Scope

- **Container image build** — the service ships as a Python wheel; a Dockerfile and
  container registry push can be added in a future task if the target platform
  requires it.
- **Infrastructure provisioning** — Terraform / Pulumi configuration for the target
  environment is maintained separately.
- **Performance / load testing** — delegated to capacity-planning work; not a gate
  on this pipeline.

---

*Generated: 2026-07-30 — aifactory task 108, subtask CICD*
