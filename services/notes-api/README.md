# notes-api

A minimal FastAPI REST API for creating, reading, updating, and deleting
text notes.

> ⚠️ **NO AUTHENTICATION. NO PERSISTENCE. LOCALHOST ONLY.**
>
> This service has **no authentication or authorization of any kind** —
> every endpoint is open to anyone who can reach it. All data is held in a
> **single in-memory Python dict with no database** — all notes are lost
> the instant the process restarts or exits, and there is no persistence
> layer whatsoever. It is intended **only** for local development on
> `localhost`. **Do not deploy this service to production, the public
> internet, or any shared/multi-tenant environment.**

## What this is

`notes-api` is a small FastAPI application that exposes a REST API for
managing notes (`title` + `body`). Notes are stored in a process-wide,
insertion-ordered dict (`app/store.py`) — there is no database, no file
storage, and no persistence across restarts. It exists as a lightweight
reference/example service for local development and testing.

## Install dependencies

From the `services/notes-api` directory:

```bash
pip install -r requirements.txt
```

## Run the service

From the `services/notes-api` directory:

```bash
uvicorn app.main:app --reload --port 8001
```

The API will be available at `http://127.0.0.1:8001`. Interactive docs are
available at `http://127.0.0.1:8001/docs` (Swagger UI) and
`http://127.0.0.1:8001/redoc`.

## Run the tests

From the `services/notes-api` directory:

```bash
pytest -q
```

## Endpoints

All request/response bodies are JSON.

### `GET /health`

Health check.

**Response `200`:**

```json
{ "status": "ok" }
```

### `POST /notes`

Create a new note.

**Request body:**

```json
{ "title": "My Title", "body": "My body text" }
```

- `title`: string, required, 1–100 characters.
- `body`: string, optional (defaults to `""`), up to 5000 characters.

**Response `201`:**

```json
{
  "id": "a1b2c3...",
  "title": "My Title",
  "body": "My body text",
  "created_at": "2026-01-01T00:00:00+00:00",
  "updated_at": "2026-01-01T00:00:00+00:00"
}
```

**Response `422`:** validation error (e.g. missing/empty `title`, or
`title`/`body` exceeding the max length).

### `GET /notes`

List all notes, in insertion order.

**Response `200`:**

```json
[
  {
    "id": "a1b2c3...",
    "title": "My Title",
    "body": "My body text",
    "created_at": "2026-01-01T00:00:00+00:00",
    "updated_at": "2026-01-01T00:00:00+00:00"
  }
]
```

### `GET /notes/{note_id}`

Fetch a single note by id.

**Response `200`:** the note (same shape as above).

**Response `404`:**

```json
{ "detail": "note not found" }
```

### `PUT /notes/{note_id}`

Replace a note's `title` and `body`. The `id` and `created_at` are
preserved; `updated_at` is refreshed.

**Request body:** same shape as `POST /notes`.

**Response `200`:** the updated note.

**Response `404`:**

```json
{ "detail": "note not found" }
```

**Response `422`:** validation error.

### `DELETE /notes/{note_id}`

Delete a note by id.

**Response `204`:** no content, on success.

**Response `404`:**

```json
{ "detail": "note not found" }
```
