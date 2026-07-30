#!/usr/bin/env python3
"""Register this one repo (aifactory-demo) with the factories that need a project.

The benchmark keeps all 4 scenarios in THIS repo, so the factories operate on
one project:
  - **AIFactory** needs a persistent project (clones the repo into its workspace).
    Registered here via ``POST /api/projects``.
  - **PFactory** targets the repo per plan-session at *emit* time (``repo`` arg) —
    no persistent project, so nothing to register; printed for clarity.
  - **TFactory** targets the repo+branch per *spec* (``run_benchmark.py`` supplies
    it) — no persistent project either.

Idempotent and best-effort. Run before the benchmark.

Usage:  python scripts/register_projects.py [--dry-run]
Endpoints/auth via the same env vars as run_benchmark.py.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.request
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.exit("PyYAML required: pip install pyyaml")

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "benchmarks" / "scenarios.yaml"
AIFACTORY = os.environ.get("AIFACTORY_API", "http://127.0.0.1:3101")
AF_TOKEN = os.environ.get("AIFACTORY_TOKEN", "")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    d = yaml.safe_load(MANIFEST.read_text())["defaults"]
    owner, repo = d["owner"], d["repo"]
    git_url = f"https://github.com/{owner}/{repo}"

    print(f"AIFactory ({AIFACTORY}): register project {repo} → {git_url}")
    if args.dry_run:
        print("  [dry-run] POST /api/projects")
    else:
        body = json.dumps({"name": repo, "git_url": git_url, "branch": "main"}).encode()
        headers = {"Content-Type": "application/json"}
        if AF_TOKEN:
            headers["Authorization"] = f"Bearer {AF_TOKEN}"
        req = urllib.request.Request(
            f"{AIFACTORY}/api/projects", data=body, headers=headers, method="POST"
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                print("  →", r.read().decode()[:200])
        except Exception as exc:  # noqa: BLE001
            print(f"  ! AIFactory register failed (may already exist): {exc}")

    print(
        "PFactory: no persistent project — repo is supplied at plan emit time "
        f"(repo={owner}/{repo})."
    )
    print(
        "TFactory: no persistent project — repo+branch supplied per spec by "
        "run_benchmark.py."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
