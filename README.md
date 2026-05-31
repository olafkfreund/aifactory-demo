# aifactory-demo

A tiny FastAPI service used as the demo target for [AIFactory](https://github.com/olafkfreund/AIFactory).

The `scripts/demo.sh` script in the AIFactory repo seeds this repo with 3 GitHub issues (resetting it to a known state each run), imports them into a local AIFactory portal as backlog tasks, and walks through the Claude → portal → agent end-to-end flow.

## Quick Start

```bash
git clone https://github.com/olafkfreund/aifactory-demo.git && cd aifactory-demo
pip install -e .
uvicorn src.app.main:app --reload
```

## What this app does

It's intentionally minimal — a single FastAPI route at `/` returning JSON.

```bash
pip install -e .
uvicorn src.app.main:app --reload
curl http://localhost:8000/
# {"app":"aifactory-demo"}
```

## Why FastAPI

AIFactory's own backend uses FastAPI, so the AI agents are familiar with the framework. The demo issues exercise the planner→coder→QA loop against routine FastAPI work (add an endpoint, add a test, fix a small bug).

## Issues the demo seeds

`scripts/demo.sh` opens these on each run:

1. **Add `/healthz` endpoint** — returns `{"status":"ok"}` + HTTP 200
2. **Document the Quick Start in README** — three-command run guide
3. **Add `/version` endpoint with tests** — reads `__version__` from `src/app/__init__.py`

Issues are closed at the start of each demo run, then re-created fresh.
