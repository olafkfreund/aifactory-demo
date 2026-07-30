# Testing Strategy: Link Shortener Service (Python/FastAPI)

**Plan reference:** 026  
**Service:** Link Shortener (Python/FastAPI)  
**Stack:** Python 3.10+, FastAPI, Pydantic v2, pytest 8, httpx

---

## 1. Overview

This document defines the three-lane testing strategy for the link-shortener
service built on FastAPI. Every acceptance criterion (AC) from the feature plan
is mapped to at least one test in one of the following lanes:

| Lane | Scope | Tool | Run command |
|------|-------|------|-------------|
| **Unit** | Pure business logic and model validation, no HTTP | `pytest` | `pytest tests/unit/` |
| **Integration (API)** | FastAPI routes exercised via `TestClient` (in-process) | `pytest` + `httpx` | `pytest tests/` |
| **E2E** | Live server started with `uvicorn`; real HTTP client | `pytest` + `httpx.AsyncClient` | `pytest tests/e2e/` |

The integration (API) lane is the primary gate because `TestClient` gives full
HTTP-level fidelity without the complexity of a running process.  E2E is
optional locally but mandatory in the staging environment before a production
deploy.

---

## 2. Acceptance-Criterion Map

Each row maps a plan AC to the lane(s) and test file(s) that cover it.

| AC# | Acceptance Criterion | Lane | Test file(s) |
|-----|---------------------|------|--------------|
| AC1 | `GET /healthz` → 200 `{"status":"ok"}` | Integration | `tests/test_root.py` |
| AC2 | `POST /links` → 201, body with 7-char alphanumeric `code` and original `url` | Unit + Integration | `tests/unit/test_link_store.py`, `tests/test_links_create.py` |
| AC3 | `GET /links/{code}` → 200 with stored url; unknown code → 404 | Integration | `tests/test_links_get.py` |
| AC4 | `GET /r/{code}` → 307 redirect with `Location` = stored url | Integration | `tests/test_redirect.py` |
| AC5 | `POST /links` with non-http(s) scheme → 422, nothing stored | Unit + Integration | `tests/unit/test_link_models.py`, `tests/test_links_create.py` |
| AC6 | `GET /links/{code}/stats` → 200; `hits` increments per redirect | Integration | `tests/test_links_stats.py` |
| AC7 | `DELETE /links/{code}` → 204; subsequent GET → 404 | Integration | `tests/test_links_delete.py` |
| AC8 | Full pytest suite passes | All lanes | `pytest -q` |

---

## 3. Unit Lane

### 3.1 Scope

Unit tests target isolated Python objects:

- `LinkStore` (in `src/app/link_store.py`) — all public methods
- `ShortenRequest` Pydantic model (in `src/app/link_models.py`) — field validators

No FastAPI app, no HTTP, no network.

### 3.2 Test file layout

```
tests/
└── unit/
    ├── __init__.py
    ├── test_link_store.py      # LinkStore unit tests
    └── test_link_models.py     # Pydantic model / validator tests
```

### 3.3 `test_link_store.py` — key scenarios

```python
from app.link_store import LinkStore, LinkNotFound
import re

CODE_RE = re.compile(r"^[a-z0-9]{7}$")


def make_store() -> LinkStore:
    """Return a fresh, empty LinkStore for each test."""
    return LinkStore()


# -- create_link --

def test_create_link_returns_code_and_url():
    store = make_store()
    result = store.create_link("https://example.com")
    assert "code" in result and "url" in result
    assert result["url"] == "https://example.com"


def test_create_link_code_is_seven_lowercase_alphanumeric():
    store = make_store()
    result = store.create_link("https://example.com")
    assert CODE_RE.match(result["code"])


def test_create_link_codes_are_unique():
    store = make_store()
    codes = {store.create_link(f"https://example.com/{i}")["code"] for i in range(20)}
    assert len(codes) == 20


# -- get_link --

def test_get_link_returns_stored_url():
    store = make_store()
    code = store.create_link("https://example.com")["code"]
    assert store.get_link(code)["url"] == "https://example.com"


def test_get_link_unknown_code_raises():
    store = make_store()
    import pytest
    with pytest.raises(LinkNotFound):
        store.get_link("aaaaaaa")


# -- get_link_stats --

def test_get_link_stats_initial_hits_zero():
    store = make_store()
    code = store.create_link("https://example.com")["code"]
    assert store.get_link_stats(code)["hits"] == 0


def test_get_link_stats_unknown_raises():
    store = make_store()
    import pytest
    with pytest.raises(LinkNotFound):
        store.get_link_stats("aaaaaaa")


# -- record_hit --

def test_record_hit_increments_hits():
    store = make_store()
    code = store.create_link("https://example.com")["code"]
    store.record_hit(code)
    store.record_hit(code)
    assert store.get_link_stats(code)["hits"] == 2


def test_record_hit_returns_url():
    store = make_store()
    code = store.create_link("https://example.com/target")["code"]
    url = store.record_hit(code)
    assert url == "https://example.com/target"


def test_record_hit_unknown_raises():
    store = make_store()
    import pytest
    with pytest.raises(LinkNotFound):
        store.record_hit("aaaaaaa")


# -- delete_link --

def test_delete_link_removes_entry():
    store = make_store()
    code = store.create_link("https://example.com")["code"]
    store.delete_link(code)
    import pytest
    with pytest.raises(LinkNotFound):
        store.get_link(code)


def test_delete_link_unknown_raises():
    store = make_store()
    import pytest
    with pytest.raises(LinkNotFound):
        store.delete_link("aaaaaaa")


def test_delete_does_not_affect_other_codes():
    store = make_store()
    code_a = store.create_link("https://example.com/a")["code"]
    code_b = store.create_link("https://example.com/b")["code"]
    store.delete_link(code_a)
    assert store.get_link(code_b)["url"] == "https://example.com/b"
```

### 3.4 `test_link_models.py` — key scenarios

```python
import pytest
from pydantic import ValidationError
from app.link_models import ShortenRequest


def test_valid_https_url_accepted():
    m = ShortenRequest(url="https://example.com")
    assert m.url == "https://example.com"


def test_valid_http_url_accepted():
    m = ShortenRequest(url="http://example.com")
    assert m.url == "http://example.com"


@pytest.mark.parametrize("bad_url", [
    "ftp://example.com",
    "javascript:alert(1)",
    "data:text/html,<h1>hi</h1>",
    "file:///etc/passwd",
    "//example.com",
    "example.com",
])
def test_invalid_scheme_raises_validation_error(bad_url):
    with pytest.raises(ValidationError):
        ShortenRequest(url=bad_url)


def test_url_field_required():
    with pytest.raises(ValidationError):
        ShortenRequest()
```

---

## 4. Integration (API) Lane

### 4.1 Scope

The integration lane exercises the FastAPI application end-to-end through the
ASGI transport layer using `httpx`'s `TestClient` (synchronous wrapper around
the ASGI interface).  No real socket is opened; tests are fast and fully
isolated.

### 4.2 Fixtures and isolation

Each test module uses an `autouse` fixture that clears the in-memory
`link_store` before and after every test:

```python
@pytest.fixture(autouse=True)
def _clear_link_store():
    from app.link_store import link_store
    with link_store._lock:
        link_store._links.clear()
    yield
    with link_store._lock:
        link_store._links.clear()
```

This guarantees test independence regardless of execution order.

### 4.3 Client setup

```python
from fastapi.testclient import TestClient
from app.main import app

# For redirect tests — never follow redirects automatically
client = TestClient(app, follow_redirects=False)
```

### 4.4 Test file map

| File | Routes under test | ACs covered |
|------|------------------|-------------|
| `tests/test_root.py` | `GET /healthz`, `GET /` | AC1 |
| `tests/test_links_create.py` | `POST /links` | AC2, AC5 |
| `tests/test_links_get.py` | `GET /links/{code}` | AC3 |
| `tests/test_redirect.py` | `GET /r/{code}` | AC4 |
| `tests/test_links_stats.py` | `GET /links/{code}/stats` | AC6 |
| `tests/test_links_delete.py` | `DELETE /links/{code}` | AC7 |

### 4.5 Representative scenarios per file

#### `tests/test_root.py`

- `GET /healthz` → 200, body is exactly `{"status": "ok"}`
- `GET /` → 200

#### `tests/test_links_create.py`

- `POST /links` with valid HTTPS URL → 201
- Response body contains `code` (7 lowercase-alphanumeric chars) and `url`
- `url` in response matches the submitted URL
- 10 POSTs yield 10 distinct codes
- Missing body → 422
- Body without `url` field → 422
- `ftp://` scheme → 422, store unchanged
- `javascript:` scheme → 422, store unchanged
- `http://` accepted → 201
- `https://` accepted → 201

#### `tests/test_links_get.py`

- Create then GET → 200 with correct `code` and `url`
- GET unknown code → 404
- Two distinct URLs stored and retrieved correctly

#### `tests/test_redirect.py`

- Create then `GET /r/{code}` → 307
- `Location` header equals stored URL
- `GET /r/{unknown}` → 404
- Two codes each redirect to their own URL

#### `tests/test_links_stats.py`

- Fresh link → `hits` = 0
- `GET /links/{unknown}/stats` → 404
- Three redirects → `hits` = 3
- Two codes track hits independently

#### `tests/test_links_delete.py`

- Create then DELETE → 204
- After DELETE, GET → 404
- After DELETE, redirect → 404
- DELETE unknown → 404
- Deleting one code does not affect another

---

## 5. E2E Lane

### 5.1 Scope

The E2E lane starts the real application with `uvicorn` and exercises it with
`httpx.AsyncClient` over a real loopback socket.  This lane is not run on
every local `pytest` invocation (it is marked with `@pytest.mark.e2e` and
excluded by default); it gates the staging deploy in CI.

### 5.2 Layout

```
tests/
└── e2e/
    ├── __init__.py
    └── test_links_e2e.py
```

### 5.3 Fixture

```python
import asyncio
import pytest
import httpx
import uvicorn
import threading

from app.main import app

@pytest.fixture(scope="session")
def live_server():
    """Start a real uvicorn server on an OS-assigned port."""
    config = uvicorn.Config(app, host="127.0.0.1", port=0, log_level="error")
    server = uvicorn.Server(config)

    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()

    # Wait until the server is ready (up to 5 s).
    import time
    deadline = time.monotonic() + 5
    while not server.started and time.monotonic() < deadline:
        time.sleep(0.05)

    port = server.servers[0].sockets[0].getsockname()[1]
    base_url = f"http://127.0.0.1:{port}"
    yield base_url

    server.should_exit = True
    thread.join(timeout=5)
```

### 5.4 Sample E2E tests

```python
@pytest.mark.e2e
def test_e2e_full_lifecycle(live_server):
    with httpx.Client(base_url=live_server, follow_redirects=False) as client:
        # Create
        resp = client.post("/links", json={"url": "https://example.com/e2e"})
        assert resp.status_code == 201
        code = resp.json()["code"]

        # Lookup
        assert client.get(f"/links/{code}").status_code == 200

        # Redirect
        r = client.get(f"/r/{code}")
        assert r.status_code == 307
        assert r.headers["location"] == "https://example.com/e2e"

        # Stats after one hit
        assert client.get(f"/links/{code}/stats").json()["hits"] == 1

        # Delete
        assert client.delete(f"/links/{code}").status_code == 204
        assert client.get(f"/links/{code}").status_code == 404
```

---

## 6. Coverage Targets

| Lane | Target | Rationale |
|------|--------|-----------|
| Unit | 100 % line coverage of `link_store.py` and `link_models.py` | Pure logic with no external dependencies — full coverage is achievable and required |
| Integration | ≥ 90 % overall line coverage of `src/app/` | A few internal-only helper paths (e.g. `_generate_code` collision avoidance) may not be covered without mocking |
| E2E | No enforced coverage target | Process-level smoke test; unit + integration provide the detail |

Run coverage locally:

```bash
pytest --cov=app --cov-report=term-missing tests/
```

---

## 7. Running the Suite

### Full suite (unit + integration)

```bash
pytest -q
```

### Unit only

```bash
pytest tests/unit/ -q
```

### Integration only

```bash
pytest tests/ --ignore=tests/unit --ignore=tests/e2e -q
```

### E2E only (requires running server or fixture)

```bash
pytest tests/e2e/ -m e2e -q
```

### With coverage

```bash
pytest --cov=app --cov-report=term-missing -q
```

---

## 8. CI Integration

The CI pipeline (see `docs/plans/026-link-shortener-service-python-fastapi-cicd-pipeline.md`)
gates every pull request on a green test run using:

```yaml
- name: Run tests
  run: pytest -q --tb=short
```

The E2E lane runs as a separate job against the staging environment after the
build stage succeeds, before any production deploy approval gate.

---

## 9. Test Tooling Summary

| Tool | Version constraint | Purpose |
|------|-------------------|---------|
| `pytest` | `>=8` | Test runner and fixture engine |
| `httpx` | `>=0.27` | ASGI `TestClient` transport + live-server HTTP client |
| `pytest-cov` | `>=5` | Coverage measurement (optional dep) |
| `uvicorn` | `>=0.32` | E2E live-server fixture |

All test dependencies are declared in `pyproject.toml` under
`[project.optional-dependencies] test`.

---

## 10. Gotchas and Notes

1. **Singleton store isolation** — `link_store` is a module-level singleton.
   All integration tests MUST clear it via the `_clear_link_store` fixture;
   otherwise test ordering affects results.

2. **Redirect follow mode** — `TestClient(app)` follows redirects by default.
   Tests for `GET /r/{code}` instantiate the client with
   `follow_redirects=False` to assert the 307 status and `Location` header
   directly.

3. **Code alphabet** — The store generates codes from `[a-z0-9]` (lowercase
   only).  Tests assert `re.compile(r"^[a-z0-9]{7}$")` to avoid false
   positives from uppercase variants.

4. **Thread safety** — `LinkStore._lock` is a `threading.Lock`.  Unit tests
   that reach into `_links` directly must acquire the lock or run
   single-threaded (the default for `pytest`).

5. **No secrets in code** — The service is public-by-design.  Tests must not
   embed real credentials, tokens, or environment-specific URLs.
