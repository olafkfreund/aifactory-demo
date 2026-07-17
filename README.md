# aifactory-demo

A tiny FastAPI service used as the demo target for [AIFactory](https://github.com/olafkfreund/AIFactory).

The `scripts/demo.sh` script in the AIFactory repo seeds this repo with 3 GitHub issues (resetting it to a known state each run), imports them into a local AIFactory portal as backlog tasks, and walks through the Claude → portal → agent end-to-end flow.

## What this app does

It's intentionally minimal — a single FastAPI route at `/` returning JSON.

```bash
pip install -e .
uvicorn src.app.main:app --reload
curl http://localhost:8000/
# {"app":"aifactory-demo"}
```

## Request-audit trail

Every handled request is recorded (method, path, status code, latency, client
key) by an audit middleware and persisted to SQLite so records survive restarts.
The trail is queryable at `GET /api/audit` (filter by `path_prefix`,
`status_class` = `2xx`/`4xx`/`5xx`, `from`/`to`, plus `limit`/`offset`). A
`GET /health` endpoint returns `{"status":"ok"}` for readiness/liveness probes.

### Operational configuration

| Env var | Purpose | Default |
| --- | --- | --- |
| `AUDIT_CLIENT_KEYS` | Comma-separated allowlist of valid client keys for `GET /api/audit`. **Fail-closed:** if unset/empty, every request is rejected with `403` — audit data is never exposed by default. | *(empty → all rejected)* |
| `AUDIT_DB_PATH` | Filesystem path for the SQLite audit database (persistence across restarts). | `data/audit.db` |

The audit endpoint requires the `X-Client-Key` header: requests without a key
get `401`, requests with an unknown key get `403`, and a key in the allowlist
gets `200`.

```bash
export AUDIT_CLIENT_KEYS=my-key
uvicorn src.app.main:app --reload
curl http://localhost:8000/health
# {"status":"ok"}
curl -H 'x-client-key: my-key' http://localhost:8000/api/audit
# {"items":[...],"count":N,"limit":100,"offset":0}
```

## Why FastAPI

AIFactory's own backend uses FastAPI, so the AI agents are familiar with the framework. The demo issues exercise the planner→coder→QA loop against routine FastAPI work (add an endpoint, add a test, fix a small bug).

## Issues the demo seeds

`scripts/demo.sh` opens these on each run:

1. **Add `/healthz` endpoint** — returns `{"status":"ok"}` + HTTP 200
2. **Document the Quick Start in README** — three-command run guide
3. **Add `/version` endpoint with tests** — reads `__version__` from `src/app/__init__.py`

Issues are closed at the start of each demo run, then re-created fresh.
