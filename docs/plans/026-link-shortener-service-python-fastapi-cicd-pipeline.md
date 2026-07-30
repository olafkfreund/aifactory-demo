# CI/CD Pipeline: Link Shortener Service (Python/FastAPI)

**Plan reference:** 026  
**Service:** Link Shortener (Python/FastAPI)  
**Platform:** GitHub Actions  
**Stack:** Python 3.12, ruff, pytest, pip-audit, Docker (optional)

---

## 1. Overview

This document defines the continuous-integration and continuous-delivery pipeline
for the link-shortener FastAPI service.  The pipeline runs on every pull request
and every push to `main`, enforcing quality gates before any code reaches
production.

Pipeline stages (in order):

```
lint ──► test ──► build ──► security-scan ──► deploy-staging ──► deploy-production
```

The first four stages run unconditionally on every push and PR.  The two deploy
stages run only on the `main` branch; `deploy-production` additionally requires
manual approval via a GitHub Actions environment protection rule.

---

## 2. Stage Definitions

### 2.1 Lint

**Purpose:** Enforce code style and catch simple errors before running tests.  
**Tool:** [ruff](https://docs.astral.sh/ruff/) (linter + formatter check)  
**Runs on:** every push, every PR  
**Failure behaviour:** blocks all downstream stages

```bash
ruff check .
ruff format --check .
```

`ruff` is configured in `pyproject.toml` under `[tool.ruff]`.  A non-zero exit
code fails the job and prevents `test`, `build`, and deploy from running.

---

### 2.2 Test

**Purpose:** Run the full pytest suite, publish a JUnit XML report, and upload
a coverage report so that coverage trends are visible in pull requests.  
**Tool:** `pytest` with `pytest-cov`  
**Runs on:** every push, every PR (after `lint` passes)  
**Failure behaviour:** blocks all downstream stages

```bash
pytest -q --tb=short \
       --junitxml=reports/junit.xml \
       --cov=app \
       --cov-report=xml:reports/coverage.xml \
       --cov-report=term-missing
```

Artifact uploads:
- `reports/junit.xml` — test results (visible in GitHub's test-summary UI)
- `reports/coverage.xml` — line coverage consumed by coverage comment bots or
  Codecov/Coveralls integrations

The E2E lane (`tests/e2e/`) is **excluded** from the PR gate to keep build time
short; it runs as a separate job in the staging deploy workflow (see §2.5).

To exclude E2E from the default run:

```bash
pytest -q --ignore=tests/e2e
```

---

### 2.3 Build

**Purpose:** Verify that the project packages cleanly and produce a distributable
artifact.  
**Tool:** `pip` / `build`  
**Runs on:** every push, every PR (after `test` passes)  
**Failure behaviour:** blocks security-scan and deploy stages

```bash
pip install build
python -m build --wheel
```

The resulting `.whl` file is uploaded as a workflow artifact so it can be
downloaded and inspected or deployed without re-building.

> **Container alternative:** if the project adopts Docker in the future, replace
> this stage with `docker buildx build --tag ghcr.io/ORG/REPO:${{ github.sha }} .`
> and push to GHCR.  The security-scan stage would then scan the image instead
> of the package.

---

### 2.4 Security Scan

**Purpose:** Audit third-party dependencies for known vulnerabilities and run
a static security analysis pass over the source code.  
**Tools:**
- [`pip-audit`](https://pypi.org/project/pip-audit/) — checks installed
  packages against PyPI advisory database
- [`bandit`](https://bandit.readthedocs.io/) — static analysis for common
  Python security pitfalls  

**Runs on:** every push, every PR (after `build` passes)  
**Failure behaviour:** blocks deploy stages; findings are surfaced as annotations

```bash
pip-audit
bandit -r src/ -ll
```

`bandit -ll` reports only medium-severity and above findings, avoiding noise
from low-confidence heuristics.

Scan reports are uploaded as workflow artifacts for audit trail purposes.

---

### 2.5 Deploy — Staging

**Purpose:** Deploy the service to the staging environment and run the E2E test
lane against the live deployment.  
**Runs on:** `main` branch only, after all four CI stages pass  
**Approval:** automatic (no manual gate for staging)

Steps:

1. Download the build artifact from the `build` stage.
2. Deploy to the staging environment (e.g. a Fly.io app, a Kubernetes namespace,
   or a Railway service) using the platform's CLI.
3. Run the E2E test lane against the staging base URL:

   ```bash
   BASE_URL=https://staging.example.com pytest tests/e2e/ -m e2e -q
   ```

4. If the E2E suite passes, mark the staging deployment as stable.

---

### 2.6 Deploy — Production

**Purpose:** Promote the staging artifact to production.  
**Runs on:** `main` branch only, after `deploy-staging` succeeds  
**Approval:** **manual** — a GitHub Actions environment named `production` has a
"Required reviewers" protection rule.  At least one designated reviewer must
approve the workflow run before the deployment step executes.

Steps:

1. Download the same artifact promoted from staging.
2. Deploy to the production environment.
3. Run a smoke test (`GET /healthz` returns `{"status":"ok"}`).
4. Tag the commit as `deploy/production/<timestamp>` for traceability.

**Rollback:** Re-run the `deploy-production` job for the previous successful
workflow run, or use the platform's rollback command
(e.g. `fly releases rollback --app APPNAME`).

---

## 3. GitHub Actions Workflow

The full pipeline is implemented in `.github/workflows/ci.yml`.

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
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -e '.[test]'
      - run: |
          pytest -q --tb=short \
            --junitxml=reports/junit.xml \
            --cov=app \
            --cov-report=xml:reports/coverage.xml \
            --cov-report=term-missing \
            --ignore=tests/e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-reports
          path: reports/

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install build
      - run: python -m build --wheel
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  security-scan:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -e . pip-audit bandit
      - run: pip-audit
      - run: bandit -r src/ -ll -o reports/bandit.json -f json || true
      - run: bandit -r src/ -ll
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: security-reports
          path: reports/bandit.json

  deploy-staging:
    runs-on: ubuntu-latest
    needs: security-scan
    if: github.ref == 'refs/heads/main'
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      - name: Deploy to staging
        run: |
          echo "Deploy dist/ to staging environment here."
          echo "Example: fly deploy --app my-app-staging"
      - name: E2E smoke tests
        env:
          BASE_URL: ${{ vars.STAGING_BASE_URL }}
        run: |
          pip install -e '.[test]'
          pytest tests/e2e/ -m e2e -q

  deploy-production:
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    environment: production          # manual approval required
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      - name: Deploy to production
        run: |
          echo "Deploy dist/ to production environment here."
          echo "Example: fly deploy --app my-app"
      - name: Production smoke test
        env:
          BASE_URL: ${{ vars.PRODUCTION_BASE_URL }}
        run: |
          pip install httpx
          python -c "
          import httpx, sys
          r = httpx.get('$BASE_URL/healthz')
          assert r.status_code == 200, f'Expected 200, got {r.status_code}'
          assert r.json() == {'status': 'ok'}, f'Unexpected body: {r.json()}'
          print('Smoke test passed.')
          "
      - name: Tag release
        run: |
          git config user.name  "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git tag "deploy/production/$(date -u +%Y%m%dT%H%M%SZ)"
          git push --tags
```

---

## 4. GitHub Environment Setup

### 4.1 Staging environment

1. In the repository **Settings → Environments**, create an environment named
   `staging`.
2. Add the variable `STAGING_BASE_URL` pointing to the staging deployment URL.
3. No manual approval required — deployments to staging are automatic.

### 4.2 Production environment

1. Create an environment named `production`.
2. Enable **Required reviewers** and add at least one team member.
3. Add the variable `PRODUCTION_BASE_URL` pointing to the production URL.
4. Optionally set a deployment branch rule to `main` only.

This ensures that the `deploy-production` job pauses until an authorised
reviewer clicks **Approve and deploy** in the GitHub Actions UI.

---

## 5. Coverage Reporting

The `test` job uploads `reports/coverage.xml` as a workflow artifact.  To
surface coverage on pull requests, integrate one of the following:

| Option | Notes |
|--------|-------|
| **Codecov** | Add `codecov/codecov-action@v4` after the pytest step; set `CODECOV_TOKEN` in repository secrets |
| **Coveralls** | Add `coverallsapp/github-action@v2` after the pytest step |
| **PR comment bot** | Use `MishaKav/pytest-coverage-comment@v1` to post coverage diffs directly on PRs |

Minimum coverage threshold (enforced locally, not in CI):

```bash
pytest --cov=app --cov-fail-under=90
```

The 90 % target matches the integration-lane goal defined in the testing
strategy document (`docs/plans/026-link-shortener-service-python-fastapi-testing-strategy.md`).

---

## 6. Tool Matrix

| Stage | Tool | Version constraint | Config location |
|-------|------|--------------------|-----------------|
| Lint | `ruff` | `>=0.4` | `pyproject.toml` `[tool.ruff]` |
| Test | `pytest` | `>=8` | `pyproject.toml` `[tool.pytest.ini_options]` |
| Test | `pytest-cov` | `>=5` | installed as test extra |
| Build | `build` | `>=1.0` | `pyproject.toml` `[build-system]` |
| Security | `pip-audit` | latest | no config needed |
| Security | `bandit` | `>=1.7` | `pyproject.toml` `[tool.bandit]` (optional) |

---

## 7. Rollback Strategy

| Environment | Rollback method |
|-------------|-----------------|
| **Staging** | Re-run the `deploy-staging` job for a previous successful workflow run |
| **Production** | Re-run the `deploy-production` job for a previous workflow run, or use the platform rollback command (e.g. `fly releases rollback`) |

All deployments are tagged (`deploy/production/<timestamp>`) so the exact commit
that is live in production is always traceable via `git tag`.

---

## 8. Local Pre-Push Checklist

Before pushing, developers should run:

```bash
# Lint
ruff check .
ruff format --check .

# Unit + integration tests
pytest -q --ignore=tests/e2e

# Security (optional, takes a few seconds)
pip-audit
bandit -r src/ -ll
```

This mirrors the CI pipeline locally and avoids surprise failures on push.
