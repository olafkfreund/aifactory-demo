from fastapi import FastAPI, Request

from . import __version__

app = FastAPI(title="aifactory-demo", version=__version__)

_request_counts: dict[str, int] = {"total": 0}


@app.middleware("http")
async def count_requests(request: Request, call_next):
    _request_counts["total"] += 1
    return await call_next(request)


@app.get("/")
async def root() -> dict[str, str]:
    return {"app": "aifactory-demo"}


@app.get("/metrics")
async def metrics() -> dict[str, int]:
    return {"total_requests": _request_counts["total"]}
