# CI/CD Pipeline — VAT Quote Endpoint with Half-Up Money Rounding

**Feature:** VAT quote endpoint with half-up money rounding  
**Endpoint:** `POST /api/quote`  
**Date:** 2026-07-30

---

## 1. Overview

This document defines the CI/CD pipeline for the `POST /api/quote` endpoint.
It specifies the stage sequence, the commands run at each stage, how coverage
reports are published, and how deploy stages are gated and approved.

The pipeline uses **GitHub Actions** (`.github/workflows/ci.yml`) as the
execution platform.  Every push to any branch and every pull-request triggers
the full pipeline.  Deploy stages run only on the `main` branch and require a
human approval step.

Pipeline stage sequence:

```
lint → test → build → security-scan → deploy (gated, manual approval)
```

All stages run inside the same job on `ubuntu-latest` using Python 3.12.
The `ruff` linter must pass before tests run; any test failure prevents the
build from proceeding; a failed security scan blocks deploy.

---

## 2. Toolchain

| Tool | Version | Purpose |
|------|---------|---------|
| `uv` | latest stable | Fast Python package installer / virtual-env manager |
| `ruff` | ≥ 0.4 | Linter and formatter (replaces flake8, isort, pyupgrade) |
| `pytest` | ≥ 8 | Test runner |
| `pytest-cov` | ≥ 5 | Coverage measurement and report generation |
| `pip-audit` | latest stable | Security scan — checks installed packages against OSV advisories |
| Docker / `docker build` | latest stable | Container image build |
| GitHub Actions | — | CI/CD platform |

---

## 3. Stage Definitions

### Stage 1 — Lint

**Runs on:** every push and pull-request  
**Blocks:** test stage if any check fails  

```bash
# Install the linter (fast — no test dependencies needed)
uv pip install ruff

# Check style and import ordering; zero-tolerance: fail on any warning
ruff check .

# Verify formatting without modifying files
ruff format --check .
```

**Rationale:** Running lint before tests keeps feedback fast for style-only
failures and ensures the test output is not polluted by formatter noise.  `ruff`
covers everything `flake8`, `isort`, and `pyupgrade` would check, in a single
sub-second pass.

---

### Stage 2 — Test

**Runs on:** every push and pull-request (after lint passes)  
**Blocks:** build stage if any test fails  

```bash
# Install the package in editable mode with test extras
uv pip install -e ".[test]"
# Also install coverage plugin
uv pip install pytest-cov

# Run the full suite with JUnit XML output (for the GitHub test-result tab)
# and HTML + term-missing coverage (published as a build artifact)
pytest \
  --junitxml=reports/junit.xml \
  --cov=app \
  --cov-report=term-missing \
  --cov-report=html:reports/htmlcov \
  --cov-fail-under=95
```

**Coverage target:** ≥ 95 % line coverage on `src/app/vat_quote.py`.  The
`--cov-fail-under=95` flag causes `pytest` to exit non-zero if the target is
not met, blocking subsequent stages.

**Artifacts published:**

| Artifact | Path | Retention |
|----------|------|-----------|
| Test results (JUnit XML) | `reports/junit.xml` | 30 days |
| HTML coverage report | `reports/htmlcov/` | 30 days |

The JUnit XML file is consumed by the GitHub Actions test-result annotation so
failures appear inline in the pull-request diff view.

---

### Stage 3 — Build

**Runs on:** every push and pull-request (after test passes)  
**Blocks:** security-scan stage if the build fails  

```bash
# Build a wheel (verifies the package is importable and hatchling metadata is valid)
uv build

# Build the container image (tagged with the short Git SHA for traceability)
docker build \
  --tag aifactory-demo:${GITHUB_SHA::8} \
  --tag aifactory-demo:latest \
  .
```

The Docker image build uses the project `Dockerfile`.  The image is not pushed
during the build stage; pushing happens in the deploy stage after security
scanning and manual approval.

---

### Stage 4 — Security Scan

**Runs on:** every push and pull-request (after build passes)  
**Blocks:** deploy stage if any HIGH or CRITICAL vulnerability is found  

```bash
# Audit installed Python packages against the OSV advisory database
pip-audit --require-hashes --strict

# Scan the built container image for OS-level CVEs
# (requires the image to be present from the build stage)
docker scout cves aifactory-demo:${GITHUB_SHA::8} \
  --exit-code \
  --only-severity HIGH,CRITICAL
```

**Policy:** The pipeline fails (and deploy is blocked) if `pip-audit` reports
any advisory or if `docker scout` finds a HIGH or CRITICAL CVE in the image.
MEDIUM and LOWER findings are reported as warnings but do not block the build.

**Rationale:** AC6 requires that no credentials or secrets are added and that
the endpoint makes no outbound network calls.  Automated scanning provides a
continuous check that dependency updates do not introduce known vulnerabilities,
complementing the static/behavioural checks in the test suite.

---

### Stage 5 — Deploy

**Runs on:** `main` branch only, after lint + test + build + security-scan all pass  
**Gate:** manual approval required via GitHub Actions environment protection rules  

```bash
# Push the verified image to the container registry
docker push aifactory-demo:${GITHUB_SHA::8}
docker push aifactory-demo:latest

# Roll out the new revision (example: Cloud Run)
gcloud run deploy aifactory-demo \
  --image aifactory-demo:${GITHUB_SHA::8} \
  --region europe-west1 \
  --platform managed
```

**Approval workflow:**

1. When all preceding stages pass on `main`, the deploy stage enters a
   "waiting for review" state.
2. A human reviewer (any member of the `deploy-approvers` GitHub team) inspects
   the build summary, test results, and security report.
3. The reviewer clicks **Approve and deploy** in the GitHub Actions UI.
4. The deploy stage runs; if it fails, it exits non-zero and the deployment is
   marked failed without a rollback.

**Rollback:** revert the commit on `main` (or push a fix commit); the pipeline
re-runs and, after approval, rolls the service forward to the previous-good
image.  Alternatively, manually re-deploy the previous image tag:

```bash
docker pull aifactory-demo:<previous-sha>
gcloud run deploy aifactory-demo \
  --image aifactory-demo:<previous-sha> \
  --region europe-west1 \
  --platform managed
```

---

## 4. Full GitHub Actions Workflow

The complete workflow definition lives at `.github/workflows/ci.yml`.  The
structure below reflects the stages defined in this document:

```yaml
name: CI

on:
  push:
    branches: ["**"]
  pull_request:

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install uv && uv pip install ruff
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
      - run: pip install uv && uv pip install -e ".[test]" pytest-cov
      - run: |
          pytest \
            --junitxml=reports/junit.xml \
            --cov=app \
            --cov-report=term-missing \
            --cov-report=html:reports/htmlcov \
            --cov-fail-under=95
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-reports
          path: reports/
          retention-days: 30

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install uv && uv build
      - uses: docker/setup-buildx-action@v3
      - run: |
          docker build \
            --tag aifactory-demo:${GITHUB_SHA::8} \
            --tag aifactory-demo:latest \
            .

  security-scan:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install uv pip-audit && uv pip install -e ".[test]"
      - run: pip-audit --require-hashes --strict
      - uses: docker/setup-buildx-action@v3
      - run: docker build --tag aifactory-demo:${GITHUB_SHA::8} .
      - run: |
          docker scout cves aifactory-demo:${GITHUB_SHA::8} \
            --exit-code \
            --only-severity HIGH,CRITICAL

  deploy:
    needs: security-scan
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://aifactory-demo.example.com
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - run: |
          docker build \
            --tag aifactory-demo:${GITHUB_SHA::8} \
            --tag aifactory-demo:latest \
            .
          docker push aifactory-demo:${GITHUB_SHA::8}
          docker push aifactory-demo:latest
      - name: Roll out new revision
        run: |
          gcloud run deploy aifactory-demo \
            --image aifactory-demo:${GITHUB_SHA::8} \
            --region europe-west1 \
            --platform managed
```

The `environment: production` block links the deploy job to a GitHub Actions
environment named `production`.  Set a **required reviewer** rule on that
environment in the repository settings to enforce manual approval.

---

## 5. Branch and Merge Policy

| Scenario | Stages run | Deploy allowed |
|----------|-----------|----------------|
| Push to feature branch | lint → test → build → security-scan | No |
| Pull request | lint → test → build → security-scan | No |
| Merge to `main` (green) | lint → test → build → security-scan → deploy (gated) | After approval |
| Merge to `main` (red) | Stops at first failed stage | No |

---

## 6. Environment Variables and Secrets

No credentials or secrets are required by the `POST /api/quote` endpoint itself
(AC6, AC7).  The following secrets are needed by the **deploy stage only** and
MUST NOT be present in application code or test fixtures:

| Secret name | Scope | Purpose |
|-------------|-------|---------|
| `DOCKER_REGISTRY_TOKEN` | deploy job | Push image to container registry |
| `GCP_SA_KEY` | deploy job | Authenticate to Google Cloud for Cloud Run deploy |

Secrets are stored in GitHub Actions repository secrets and injected only into
the deploy job via `env:`.  They are never echoed to logs.

---

## 7. Acceptance Criteria Coverage

| AC | Stage that validates it | How |
|----|------------------------|-----|
| Lint, test, build, security-scan run on every push and PR | All stages | `on: push` + `on: pull_request` triggers |
| Test stage runs full suite and publishes coverage report | `test` stage | `pytest --cov` + `upload-artifact` |
| Deploy stages gated on green build, require manual approval | `deploy` stage | `needs: security-scan` + GitHub environment reviewer rule |
