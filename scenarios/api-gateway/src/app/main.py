from fastapi import FastAPI, Request, Depends, Query
from fastapi.responses import JSONResponse

from . import __version__
from .rate_limiter import RateLimiter, RateLimitExceeded

app = FastAPI(title="api-gateway", version=__version__)

@app.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}

# Dependency for rate limiting
def rate_limit(request: Request):
    limiter = RateLimiter()
    limiter.check(request.client.host)
    return limiter

@app.get("/echo")
async def echo(msg: str = Query(...), request: Request = Depends(rate_limit)):
    return {"echo": msg}

@app.exception_handler(RateLimitExceeded)
async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"}, headers={"Retry-After": str(exc.retry_after)})
