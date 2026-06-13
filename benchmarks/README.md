# Factory PARR benchmark

A repeatable benchmark that runs **one unit of work through all four scenarios**
across the full Factory PARR pipeline:

```
PFactory (plan) ──▶ AIFactory (code) ──▶ TFactory (verify)
        └──────────── threaded by the GitHub epic # (RFC-0001 correlation_key) ────────────┘
```

Everything lives in **this one repo** (`aifactory-demo`), registered once in each
factory. Each scenario builds into its own subdir + branch so the four runs never
collide.

## Scenarios

| Slug | What | Lang | Verify | Branch / subdir |
|---|---|---|---|---|
| `api-gateway` | FastAPI gateway w/ rate limiting (429 + `Retry-After`) | Python | full (pytest, unit+api) | `bench/api-gateway` · `scenarios/api-gateway/` |
| `rust-hello` | greeting library + CLI | Rust | full (cargo test) | `bench/rust-hello` · `scenarios/rust-hello/` |
| `ts-tictactoe` | console Tic-Tac-Toe engine | TypeScript | full (vitest) | `bench/ts-tictactoe` · `scenarios/ts-tictactoe/` |
| `tf-k8s` | Terraform module: k3d cluster + namespace | Terraform | validate-only | `bench/tf-k8s` · `scenarios/tf-k8s/` |

> **Why TypeScript for tic-tac-toe (not Go)?** TFactory has no Go test-generation
> framework but full vitest/jest support, so TS completes the whole plan→code→verify
> loop. Terraform is `validate`-only for the same reason (partial TFactory support).

The plan briefs (with explicit `## Acceptance Criteria`, which PFactory requires)
live in `scenarios/<slug>/brief.md`.

## Layout

```
benchmarks/
  scenarios.yaml              # the manifest the scripts read
  scenarios/<slug>/brief.md   # PFactory plan brief per scenario
  results/                    # run output: <slug>.json + RESULTS.md leaderboard
scripts/
  register_projects.py        # register this repo in the factories (AIFactory project)
  seed_issues.py              # create labels + one importable epic issue per scenario
  run_benchmark.py            # the PARR orchestrator (plan→code→verify + metrics)
```

## Prerequisites

- The four factories reachable (defaults; override via env):
  `PFACTORY_API=:3198  AIFACTORY_API=:3101  TFACTORY_API=:3102  CFACTORY_API=:3111`
- Tokens if a factory requires auth: `PFACTORY_TOKEN` / `AIFACTORY_TOKEN` / `TFACTORY_TOKEN`.
- `pip install pyyaml` (see `scripts/requirements.txt`); `gh` CLI authenticated (for `seed_issues.py`).

## Running (do this deliberately — it costs time + tokens)

```bash
# 0. one-time: register the repo + seed labels/issues
python scripts/register_projects.py
python scripts/seed_issues.py

# 1. dry-run first — prints the exact REST flow, makes no calls
python scripts/run_benchmark.py --all --dry-run

# 2. run one scenario, or all
python scripts/run_benchmark.py --scenario api-gateway
python scripts/run_benchmark.py --all

# restrict to a single stage while iterating
python scripts/run_benchmark.py --scenario rust-hello --stage plan
```

### Provider A/B (Claude vs Gemini)

Set `BENCH_MODEL` to override the model without editing `scenarios.yaml`:

```bash
# Gemini for the coding phase (planning stays Claude — it is pinned, see runbook):
BENCH_MODEL=gemini-2.5-pro python scripts/run_benchmark.py --scenario api-gateway
# omit BENCH_MODEL for the factory default (Claude / claude-sonnet-4-6)
```

### Running against the LIVE cluster (not localhost)

The deployed fleet sits behind SSO and the agent/CI sandbox cannot
`port-forward` to the pods. Run the harness **inside the AIFactory pod** (it has a
clone of this repo) against in-cluster service DNS, with the shared
`APP_API_TOKEN` as the Bearer. Full step-by-step, the live ports
(pfactory=3114, tfactory=3103), how to read results, and the
"`human_review` == success" rule are in the Factory runbook:
**`Factory/docs/dev/benchmark-matrix-runbook.md`**.

## Metrics

Per scenario → `results/<slug>.json`: per-stage (plan/code/verify) wall-clock +
status, plus handback count, token usage, $ cost, and overall pass/fail. Rolled
up into `results/RESULTS.md` (leaderboard).

## What the benchmark exercises

- **PFactory:** brief → review gates → approval → emit epic + child issues.
- **AIFactory:** import the epic → spec→plan→code→QA on the scenario branch.
- **TFactory:** generate + run the verdict pipeline (coverage/stability/mutation/
  lint/semantic) and, on failure, the handback loop back to AIFactory.
- **CFactory:** threads the whole unit by `correlation_key` (the epic #).

See the repo root `README.md` and the `factory-demo` skill for the live topology
and the REST contract each script speaks.
