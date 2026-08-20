from fastapi import FastAPI, Request, Depends, Query
from fastapi.responses import JSONResponse
import time
from typing import Dict

class RateLimitExceeded(Exception):
    def __init__(self, retry_after: int):
        self.retry_after = retry_after

_rate_store: Dict[str, Dict[str, int]] = {}
_LIMIT = 5
_WINDOW = 60

def rate_limiter(request: Request):
    host = request.client.host
    now = int(time.time())
    data = _rate_store.setdefault(host, {"count": 0, "reset": now})
    # reset if window passed
    if now - data["reset"] >= _WINDOW:
        data["count"] = 0
        data["reset"] = now
    data["count"] += 1
    if data["count"] > _LIMIT:
        retry_after = data["reset"] + _WINDOW - now
        raise RateLimitExceeded(retry_after)
    return True

app = FastAPI(title="api-gateway", version="0.1.0")

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"}, headers={"Retry-After": str(exc.retry_after)})

@app.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}

@app.get("/echo")
async def echo(msg: str = Query(...), _: bool = Depends(rate_limiter)) -> dict[str, str]:
    return {"echo": msg}
