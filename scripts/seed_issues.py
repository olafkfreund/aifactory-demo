#!/usr/bin/env python3
"""Seed the benchmark labels + one importable epic issue per scenario.

Creates (idempotently) the labels the PARR pipeline needs and one GitHub issue
per scenario in ``benchmarks/scenarios.yaml``. Each issue carries the scenario
brief as its body and is labelled so it can be imported + auto-started by the
factories (``epic``, ``benchmark``, ``scenario:<slug>``, ``lang:<x>`` plus the
handoff labels PFactory/AIFactory use).

These issues are the human-visible entry points for the benchmark; the
orchestrator (``run_benchmark.py``) feeds the same briefs to PFactory, which
emits the detailed child work-issues during the run.

Uses the ``gh`` CLI (so it inherits your auth). Idempotent: re-running updates
labels (``--force``) and skips issues whose exact title already exists.

Usage:
    python scripts/seed_issues.py            # create labels + issues
    python scripts/seed_issues.py --dry-run
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.exit("PyYAML required: pip install pyyaml")

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "benchmarks" / "scenarios.yaml"

# Labels the PARR emit/import/handoff flow relies on (superset of per-scenario labels).
PIPELINE_LABELS = [
    ("epic", "8250df"), ("benchmark", "0e8a16"), ("pfactory", "5319e7"),
    ("handoff:aifactory", "1d76db"), ("handoff:tfactory", "0052cc"),
    ("handover:tfactory", "0052cc"), ("kind:feature", "a2eeef"),
    ("lang:python", "3572A5"), ("lang:rust", "dea584"),
    ("lang:typescript", "2b7489"), ("lang:terraform", "844FBA"),
    ("scenario:api-gateway", "fbca04"), ("scenario:rust-hello", "fbca04"),
    ("scenario:ts-tictactoe", "fbca04"), ("scenario:tf-k8s", "fbca04"),
    ("priority:p1", "d93f0b"),
]


def sh(args: list[str], dry: bool) -> str:
    if dry:
        print("  [dry-run] " + " ".join(args))
        return ""
    return subprocess.run(args, check=True, capture_output=True, text=True).stdout.strip()


def existing_titles(owner_repo: str) -> set[str]:
    out = subprocess.run(
        ["gh", "issue", "list", "--repo", owner_repo, "--state", "all",
         "--limit", "200", "--json", "title"],
        check=True, capture_output=True, text=True).stdout
    return {i["title"] for i in json.loads(out or "[]")}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    m = yaml.safe_load(MANIFEST.read_text())
    owner, repo = m["defaults"]["owner"], m["defaults"]["repo"]
    owner_repo = f"{owner}/{repo}"

    print(f"=== labels on {owner_repo} ===")
    for name, color in PIPELINE_LABELS:
        sh(["gh", "label", "create", name, "--repo", owner_repo,
            "--color", color, "--force"], args.dry_run)

    have = set() if args.dry_run else existing_titles(owner_repo)
    print(f"=== issues on {owner_repo} ===")
    for sc in m["scenarios"]:
        title = f"[bench] {sc['title']}"
        if title in have:
            print(f"  skip (exists): {title}")
            continue
        brief_path = ROOT / sc["brief"]
        brief = brief_path.read_text() if brief_path.exists() else sc["title"]
        body = (
            f"> **PARR benchmark scenario** `{sc['slug']}` — plan (PFactory) → "
            f"code (AIFactory) → verify (TFactory).\n"
            f"> Build target: `{sc['subdir']}/` on branch `{sc['branch']}`. "
            f"Framework: `{sc['framework']}`. Verify: `{sc.get('verify_level','full')}`.\n\n"
            f"Driven by `scripts/run_benchmark.py --scenario {sc['slug']}`.\n\n"
            f"---\n\n{brief}"
        )
        labels = ",".join(sc.get("labels", []) + ["handoff:aifactory", "handoff:tfactory"])
        sh(["gh", "issue", "create", "--repo", owner_repo, "--title", title,
            "--body", body, "--label", labels], args.dry_run)
        print(f"  created: {title}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
