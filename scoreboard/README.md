# scoreboard

A tiny stdlib-only (`node:http`, `node:fs`) tic-tac-toe score board service, built to sit alongside the [aifactory-demo](../README.md) FastAPI app. No framework, no build step, no dependencies.

## What this app does

It serves a single static page at `/` with a form for submitting `{name, score}` entries, and a JSON API at `/scores` for listing and recording them. Scores are kept in memory only — nothing is persisted, and the store resets whenever the server restarts.

## Running it

```bash
node scoreboard/server.js
# or
npm run scoreboard
```

The server listens on the port given by the `PORT` environment variable, defaulting to `3100`:

```bash
PORT=4000 node scoreboard/server.js
```

## Try it with curl

```bash
curl http://localhost:3100/
# <!DOCTYPE html>... (the score board page)

curl http://localhost:3100/scores
# []

curl -X POST http://localhost:3100/scores \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada","score":3}'
# {"name":"Ada","score":3}

curl http://localhost:3100/scores
# [{"name":"Ada","score":3}]
```

`/scores` returns entries sorted by score, descending.

## Running the tests

Unit/API tests use Jest:

```bash
npx jest scoreboard
```

Browser end-to-end tests use Playwright, scoped via `-c scoreboard` to the config in this directory:

```bash
npx playwright test -c scoreboard
# or
npm run test:scoreboard
```

## Known limitations

- `npm run test:scoreboard` shells out to `playwright`. No `playwright` devDependency is added to this repo by design (the scoreboard service itself has zero dependencies), so running that script requires `playwright` to already be resolvable on your `PATH` or `npx` cache — e.g. via a global install or a previous `npx playwright install`.
- Scores are validated with `Number.isInteger`, so negative integers (e.g. `-5`) are intentionally accepted as valid scores. Only non-integers (floats, numeric strings, etc.) and empty/non-string names are rejected.
