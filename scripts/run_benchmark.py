#!/usr/bin/env python3
"""PARR benchmark orchestrator — PFactory (plan) → AIFactory (code) → TFactory (verify).

Drives the documented Factory REST flow for each scenario in
``benchmarks/scenarios.yaml`` and records per-stage metrics (wall-clock, tokens,
cost, handback count, pass/fail) to ``benchmarks/results/<slug>.json``, then
rolls them into ``benchmarks/results/RESULTS.md``.

This is the automation layer for the 4-scenario benchmark. It is intentionally
stdlib-only (``urllib``) apart from PyYAML for the manifest, so it runs anywhere
the factories are reachable. Every external host is trusted (local factories),
hence ``# noqa: S310`` on the urlopen calls.

Usage:
    python scripts/run_benchmark.py --scenario api-gateway
    python scripts/run_benchmark.py --all
    python scripts/run_benchmark.py --all --dry-run          # plan only, no calls
    python scripts/run_benchmark.py --scenario rust-hello --stage plan   # one stage

Endpoints (override via env): PFACTORY_API, AIFACTORY_API, TFACTORY_API, CFACTORY_API.
Auth: AIFACTORY_TOKEN / TFACTORY_TOKEN / PFACTORY_TOKEN (Bearer) if the factory needs it.
Model: BENCH_MODEL=<model> overrides the per-scenario model (e.g. gemini-2.5-pro
for a Gemini coding run). Running on the live cluster: see
Factory/docs/dev/benchmark-matrix-runbook.md.

NOTE: this script does not *start* anything unless invoked. The benchmark is run
deliberately, separately from scaffolding the repo.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.exit("PyYAML required: pip install pyyaml")

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "benchmarks" / "scenarios.yaml"
RESULTS_DIR = ROOT / "benchmarks" / "results"

ENDPOINTS = {
    "pfactory": os.environ.get("PFACTORY_API", "http://127.0.0.1:3198"),
    "aifactory": os.environ.get("AIFACTORY_API", "http://127.0.0.1:3101"),
    "tfactory": os.environ.get("TFACTORY_API", "http://127.0.0.1:3102"),
    "cfactory": os.environ.get("CFACTORY_API", "http://127.0.0.1:3111"),
}
TOKENS = {
    "pfactory": os.environ.get("PFACTORY_TOKEN", ""),
    "aifactory": os.environ.get("AIFACTORY_TOKEN", ""),
    "tfactory": os.environ.get("TFACTORY_TOKEN", ""),
}

# Build/verify can be long; poll budgets (seconds).
BUILD_TIMEOUT = int(os.environ.get("BENCH_BUILD_TIMEOUT", "5400"))   # 90 min
VERIFY_TIMEOUT = int(os.environ.get("BENCH_VERIFY_TIMEOUT", "3600"))  # 60 min — TFactory test-gen on a large build can take 30-35 min
POLL_INTERVAL = int(os.environ.get("BENCH_POLL_INTERVAL", "15"))


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class DryRun(Exception):
    """Raised internally to short-circuit network calls in --dry-run mode."""


@dataclass
class StageMetric:
    name: str
    started_at: str | None = None
    ended_at: str | None = None
    duration_s: float | None = None
    status: str = "pending"          # pending | passed | failed | skipped | error
    detail: dict = field(default_factory=dict)


@dataclass
class ScenarioResult:
    slug: str
    title: str
    correlation_key: str | None = None
    started_at: str = field(default_factory=_now)
    ended_at: str | None = None
    stages: dict = field(default_factory=dict)        # plan/code/verify → StageMetric
    handbacks: int = 0
    tokens: int = 0
    cost_usd: float = 0.0
    overall: str = "pending"

    def stage(self, name: str) -> StageMetric:
        m = self.stages.get(name)
        if m is None:
            m = StageMetric(name=name)
            self.stages[name] = m
        return m

    def to_dict(self) -> dict:
        d = asdict(self)
        d["stages"] = {k: asdict(v) for k, v in self.stages.items()}
        return d


# ── HTTP ─────────────────────────────────────────────────────────────────────


class Client:
    """Tiny JSON REST client over urllib with optional Bearer auth + dry-run."""

    def __init__(self, service: str, dry_run: bool):
        self.service = service
        self.base = ENDPOINTS[service].rstrip("/")
        self.token = TOKENS.get(service, "")
        self.dry_run = dry_run

    def call(self, method: str, path: str, body: dict | None = None, timeout: int = 30):
        url = f"{self.base}{path}"
        if self.dry_run:
            print(f"  [dry-run] {method} {url}" + (f"  body={json.dumps(body)[:200]}" if body else ""))
            raise DryRun
        data = json.dumps(body).encode() if body is not None else None
        # Browser-like User-Agent: the live factories sit behind Cloudflare,
        # which 403s the default ``Python-urllib/x.y`` UA as a bot. A Mozilla
        # UA passes the managed challenge.
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) aifactory-bench/1.0",
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        # The live factories occasionally 500 transiently (cold start, deploy
        # roll); retry 5xx and connection errors with linear backoff.
        for attempt in range(3):
            try:
                with urllib.request.urlopen(req, timeout=timeout) as resp:  # noqa: S310
                    raw = resp.read().decode() or "{}"
                return json.loads(raw) if raw.strip().startswith(("{", "[")) else {"raw": raw}
            except urllib.error.HTTPError as exc:
                if exc.code >= 500 and attempt < 2:
                    time.sleep(5 * (attempt + 1))
                    continue
                raise
            except urllib.error.URLError:
                if attempt < 2:
                    time.sleep(5 * (attempt + 1))
                    continue
                raise


def _ensure_project(client: Client, name: str, git_url: str, branch: str = "main") -> str | None:
    """Reuse a registered project by git_url / name suffix, else register it.

    The deployed factories register repos under derived names (e.g.
    ``olafkfreund-aifactory-demo``), so a blind POST 409s on every re-run.
    """
    def _match(items):
        for p in items:
            pname = p.get("name", "")
            if p.get("git_url") == git_url or pname == name or pname.endswith(f"-{name}"):
                return p.get("project_id") or p.get("id")
        return None

    existing = client.call("GET", "/api/projects")
    items = existing if isinstance(existing, list) else existing.get("projects", [])
    pid = _match(items)
    if pid:
        return pid
    try:
        proj = client.call("POST", "/api/projects", {"name": name, "git_url": git_url, "branch": branch})
        return proj.get("project_id") or proj.get("id")
    except urllib.error.HTTPError as exc:
        if exc.code == 409:  # raced or exists under a derived name — re-list
            existing = client.call("GET", "/api/projects")
            items = existing if isinstance(existing, list) else existing.get("projects", [])
            return _match(items)
        raise


# ── Stages ─────────────────────────────────────────────────────────────────


def stage_plan(sc: dict, defaults: dict, res: ScenarioResult, dry: bool) -> str | None:
    """PFactory: ingest brief → process → approve → emit issues. Returns epic #."""
    m = res.stage("plan")
    m.started_at, t0 = _now(), time.monotonic()
    pf = Client("pfactory", dry)
    owner, repo = defaults["owner"], defaults["repo"]
    brief = (ROOT / sc["brief"]).read_text() if (ROOT / sc["brief"]).exists() else sc["title"]
    try:
        sess = pf.call("POST", "/api/plan/sessions/ingest-text", {
            "title": sc["title"], "category": defaults["pfactory"]["category"],
            "channel": defaults["pfactory"]["channel"], "text": brief,
        })
        sid = sess.get("session_id") or sess.get("id")
        pf.call("POST", f"/api/plan/sessions/{sid}/process", {})
        pf.call("POST", f"/api/plan/sessions/{sid}/approve",
                {"approver": owner + "@users.noreply.github.com", "auto_restart": False})
        # Emit creates the whole epic tree (epic + a child issue per AC/component,
        # sub-issue links, and label bootstrap per issue) — easily >30s. Give it a
        # generous timeout so the default 30s doesn't trip the 5xx/URLError retry,
        # which would re-run emit and create DUPLICATE epic trees.
        emit = pf.call("POST", f"/api/plan/sessions/{sid}/emit",
                       {"repo": f"{owner}/{repo}", "dry_run": False}, timeout=600)
        epic = str(emit.get("epic_number") or emit.get("epic") or "")
        m.detail = {"session_id": sid, "epic_number": epic}
        m.status = "passed" if epic else "failed"
        res.correlation_key = epic or res.correlation_key
        return epic or None
    except DryRun:
        m.status = "skipped"
        return None
    except Exception as exc:  # noqa: BLE001
        m.status, m.detail = "error", {"error": str(exc)}
        return None
    finally:
        m.ended_at, m.duration_s = _now(), round(time.monotonic() - t0, 1)


def stage_code(sc: dict, defaults: dict, epic: str | None, res: ScenarioResult, dry: bool) -> str | None:
    """AIFactory: ensure project → create task from the epic → start → poll. Returns task_id."""
    m = res.stage("code")
    m.started_at, t0 = _now(), time.monotonic()
    af = Client("aifactory", dry)
    owner, repo = defaults["owner"], defaults["repo"]
    afopt = {**defaults["aifactory"], **(sc.get("aifactory") or {})}
    # Provider/model override for A/B runs (e.g. Gemini vs Claude on the same
    # scenario) without editing scenarios.yaml: BENCH_MODEL=<model> wins over
    # the scenario/default model. Empty/unset → keep the manifest's model.
    _model_override = os.environ.get("BENCH_MODEL", "").strip()
    if _model_override:
        afopt["model"] = _model_override
    try:
        project_id = _ensure_project(af, repo, f"https://github.com/{owner}/{repo}")
        task = af.call("POST", "/api/tasks", {
            "title": sc["title"],
            "description": f"Benchmark scenario {sc['slug']}. Build under {sc['subdir']}/. "
                           f"Correlation epic #{epic}. See benchmarks/{sc['brief']}.",
            "project_id": project_id,
            "metadata": {"correlation_key": epic, "github_repo": f"{owner}/{repo}",
                         "epic_issue": epic, "scenario": sc["slug"]},
        })
        task_id = task.get("task_id") or task.get("id")
        af.call("POST", f"/api/tasks/{task_id}/start", {
            "auto_continue": True, "mode": afopt["mode"], "parallel": afopt["parallel"],
            "workers": afopt["workers"], "baseBranch": sc["branch"], "model": afopt.get("model"),
        })
        ok = _poll(af, f"/api/tasks/{task_id}/status", BUILD_TIMEOUT,
                   done=lambda s: not s.get("is_running", True))
        # AIFactory's per-task token/cost breakdown lives at /token-usage
        # (camelCase totals), not /usage. A missing endpoint silently 404'd to 0.
        task_tokens = 0
        try:
            usage = af.call("GET", f"/api/tasks/{task_id}/token-usage")
            task_tokens = int(usage.get("totalTokens", usage.get("total_tokens", 0)) or 0)
            res.tokens += task_tokens
            res.cost_usd += float(usage.get("totalCostUsd", usage.get("cost_usd", 0.0)) or 0.0)
        except Exception:  # noqa: BLE001 — usage is best-effort, never fail the stage
            pass
        # `is_running == False` alone is NOT success. A build that fails its
        # planning gate (e.g. provider auth 401) or parks at human_review stops
        # running within seconds having consumed ZERO tokens. Gating "passed" on
        # is_running only let a dead build masquerade as passed in 30s — which is
        # exactly how a Claude 401 hid behind a green code stage. A real build
        # always consumes tokens, so require tokens > 0 for success.
        built = ok and task_tokens > 0
        m.detail = {"task_id": task_id, "project_id": project_id, "tokens": task_tokens,
                    "reason": None if built else (
                        "build timed out" if not ok
                        else "0 tokens — build did not run (provider/plan failure?)")}
        m.status = "passed" if built else "failed"
        return task_id
    except DryRun:
        m.status = "skipped"
        return None
    except Exception as exc:  # noqa: BLE001
        m.status, m.detail = "error", {"error": str(exc)}
        return None
    finally:
        m.ended_at, m.duration_s = _now(), round(time.monotonic() - t0, 1)


def stage_verify(sc: dict, defaults: dict, epic: str | None, res: ScenarioResult, dry: bool) -> None:
    """TFactory: create spec for the branch + run the verdict pipeline."""
    m = res.stage("verify")
    m.started_at, t0 = _now(), time.monotonic()
    level = sc.get("verify_level", "full")
    if level == "validate-only":
        m.status, m.detail = "skipped", {"reason": "validate-only (terraform fmt/init/validate run in-tree, not via TFactory)"}
        m.ended_at, m.duration_s = _now(), round(time.monotonic() - t0, 1)
        return
    tf = Client("tfactory", dry)
    lanes = (sc.get("tfactory") or {}).get("lanes") or defaults["tfactory"]["lanes"]
    try:
        # TFactory v0.9.x contract: ensure the project is registered, then
        # POST /api/specs/ingest {project_id, spec_id, spec_text}. The planner
        # auto-runs on ingest (#347) — there is no separate /run call.
        owner, repo = defaults["owner"], defaults["repo"]
        brief = (ROOT / sc["brief"]).read_text() if (ROOT / sc["brief"]).exists() else sc["title"]
        project_id = _ensure_project(tf, repo, f"https://github.com/{owner}/{repo}")
        spec_id = f"bench-{sc['slug']}-{int(time.time())}"
        spec = tf.call("POST", "/api/specs/ingest", {
            "project_id": project_id, "spec_id": spec_id, "spec_text": brief,
        }, timeout=120)
        # An ingested spec's status lives in its WORKSPACE (.../workspaces/{pid}/
        # specs/{sid}/status.json), surfaced at GET /api/tfactory/tasks/{spec_id}
        # with the verdict under `status_json.status`. The global GET
        # /api/tasks/{id} reads a DIFFERENT location and 404s for ingested specs,
        # so the verdict was never seen. Poll the workspace endpoint instead.
        # NOTE: include every TERMINAL verdict TFactory can emit, or the poll
        # waits the full VERIFY_TIMEOUT for one that never comes. ``triaged_empty``
        # (triager committed 0 tests — e.g. an unsupported target language fell
        # back to pytest and produced nothing runnable) is terminal-FAILED but was
        # missing here, so a go-hello run burned the full hour before reading it.
        terminal = {"completed", "passed", "triaged", "triaged_empty", "failed",
                    "error", "stuck", "needs_human", "human_review", "needs_review", "done"}

        def _verdict(s: dict) -> str:
            sj = s.get("status_json") or {}
            return str(sj.get("status") or s.get("status") or "")

        _poll(tf, f"/api/tfactory/tasks/{spec_id}", VERIFY_TIMEOUT,
              done=lambda s: _verdict(s) in terminal)
        final = tf.call("GET", f"/api/tfactory/tasks/{spec_id}")
        verdict = _verdict(final)
        sj = final.get("status_json") or {}
        res.handbacks += int(sj.get("correction_cycle", final.get("correction_cycle", 0)) or 0)
        m.detail = {"spec_id": spec_id, "lanes": lanes, "verdict": verdict}
        m.status = "passed" if verdict in {"completed", "passed", "triaged"} else "failed"
    except DryRun:
        m.status = "skipped"
    except Exception as exc:  # noqa: BLE001
        m.status, m.detail = "error", {"error": str(exc)}
    finally:
        m.ended_at, m.duration_s = _now(), round(time.monotonic() - t0, 1)


def _poll(client: Client, path: str, timeout: int, *, done) -> bool:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        try:
            state = client.call("GET", path)
        except DryRun:
            return True
        except Exception:  # noqa: BLE001
            time.sleep(POLL_INTERVAL)
            continue
        if done(state):
            return True
        time.sleep(POLL_INTERVAL)
    return False


# ── Driver ───────────────────────────────────────────────────────────────


def run_scenario(sc: dict, defaults: dict, stages: list[str], dry: bool) -> ScenarioResult:
    res = ScenarioResult(slug=sc["slug"], title=sc["title"])
    print(f"\n=== scenario: {sc['slug']} — {sc['title']} ===")
    epic = None
    if "plan" in stages:
        epic = stage_plan(sc, defaults, res, dry)
    if "code" in stages:
        epic = stage_code(sc, defaults, epic, res, dry) and epic or epic
    if "verify" in stages:
        # Only verify when there's a real build to verify. If the code stage
        # didn't pass (e.g. provider failure → 0 tokens), TFactory has nothing
        # to test and would just burn the full 30-min verify timeout before
        # failing — skip it loudly instead.
        code_failed = "code" in stages and res.stages.get("code") and \
            res.stages["code"].status not in ("passed", "skipped")
        if code_failed and not dry:
            mv = res.stage("verify")
            mv.started_at = mv.ended_at = _now()
            mv.duration_s, mv.status = 0.0, "skipped"
            mv.detail = {"reason": "code stage did not produce a build — nothing to verify"}
        else:
            stage_verify(sc, defaults, epic, res, dry)
    res.ended_at = _now()
    statuses = {m.status for m in res.stages.values()}
    res.overall = "passed" if statuses and statuses <= {"passed", "skipped"} else (
        "skipped" if statuses == {"skipped"} else "failed")
    if not dry:
        RESULTS_DIR.mkdir(parents=True, exist_ok=True)
        (RESULTS_DIR / f"{sc['slug']}.json").write_text(json.dumps(res.to_dict(), indent=2))
    return res


def write_leaderboard(results: list[ScenarioResult]) -> None:
    lines = ["# Benchmark results", "", f"_Generated {_now()}_", "",
             "| Scenario | Plan | Code | Verify | Handbacks | Tokens | Cost (USD) | Overall |",
             "|---|---|---|---|---|---|---|---|"]
    def s(r, n):
        m = r.stages.get(n)
        return f"{m.status} ({m.duration_s}s)" if m and m.duration_s is not None else (m.status if m else "—")
    for r in results:
        lines.append(f"| {r.slug} | {s(r,'plan')} | {s(r,'code')} | {s(r,'verify')} | "
                     f"{r.handbacks} | {r.tokens} | {r.cost_usd:.4f} | **{r.overall}** |")
    (RESULTS_DIR / "RESULTS.md").write_text("\n".join(lines) + "\n")


def main() -> int:
    ap = argparse.ArgumentParser(description="PARR benchmark orchestrator")
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--scenario", help="run one scenario by slug")
    g.add_argument("--all", action="store_true", help="run every scenario")
    ap.add_argument("--stage", action="append", choices=["plan", "code", "verify"],
                    help="restrict to specific stage(s); default all three")
    ap.add_argument("--dry-run", action="store_true", help="print the REST flow, make no calls")
    args = ap.parse_args()

    manifest = yaml.safe_load(MANIFEST.read_text())
    defaults, scenarios = manifest["defaults"], manifest["scenarios"]
    stages = args.stage or ["plan", "code", "verify"]

    chosen = scenarios if args.all else [s for s in scenarios if s["slug"] == args.scenario]
    if not chosen:
        sys.exit(f"unknown scenario {args.scenario!r}; known: {[s['slug'] for s in scenarios]}")

    print(f"endpoints: {ENDPOINTS}")
    print(f"stages: {stages}  dry_run: {args.dry_run}")
    results = [run_scenario(sc, defaults, stages, args.dry_run) for sc in chosen]
    if not args.dry_run:
        RESULTS_DIR.mkdir(parents=True, exist_ok=True)
        write_leaderboard(results)
        print(f"\nWrote {RESULTS_DIR}/RESULTS.md")
    for r in results:
        print(f"  {r.slug}: {r.overall}")
    return 0 if all(r.overall in {"passed", "skipped"} for r in results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
