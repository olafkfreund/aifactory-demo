import time

from fastapi import FastAPI

from . import __version__

app = FastAPI(title="aifactory-demo", version=__version__)

# Track app startup time for uptime calculation
_app_start_time = time.time()


@app.get("/")
async def root() -> dict[str, str]:
    return {"app": "aifactory-demo"}


@app.get("/status")
async def status() -> dict[str, str | float]:
    uptime_seconds = time.time() - _app_start_time
    return {"status": "ok", "uptime_seconds": uptime_seconds}
