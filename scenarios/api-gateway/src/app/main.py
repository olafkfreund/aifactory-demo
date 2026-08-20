from fastapi import FastAPI, Request, Depends
from fastapi.responses import JSONResponse
import os, time, math

class RateLimitExceeded(Exception):
    def __init__(self, retry_after: int):
        self.retry_after = retry_after

# Rate limiter config
RATE_LIMIT_MAX = int(os.getenv("RATE_LIMIT_MAX", "5"))
RATE_LIMIT_WINDOW_SECONDS = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "1"))

# In-memory store: ip -> (count, window_start)
_rate_limit_store: dict[str, tuple[int, float]] = {}

def rate_limiter(request: Request):
    client_ip = request.client.host if request.client else "anonymous"
    now = time.time()
    count, start = _rate_limit_store.get(client_ip, (0, now))
    # reset if window passed
    if now - start >= RATE_LIMIT_WINDOW_SECONDS:
        start = now
        count = 0
    count += 1
    if count > RATE_LIMIT_MAX:
        retry_after = math.ceil(start + RATE_LIMIT_WINDOW_SECONDS - now)
        raise RateLimitExceeded(retry_after)
    _rate_limit_store[client_ip] = (count, start)
    return True

app = FastAPI(title="api-gateway", version="0.1.0")

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    return JSONResponse(status_code=429, content={"detail": "rate limit exceeded"}, headers={"Retry-After": str(exc.retry_after)})

@app.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}

@app.get("/echo")
async def echo(msg: str, _: bool = Depends(rate_limiter)) -> dict[str, str]:
    return {"echo": msg}
