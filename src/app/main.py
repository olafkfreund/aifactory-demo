from fastapi import FastAPI

from . import __version__

app = FastAPI(title="aifactory-demo", version=__version__)


@app.get("/")
async def root() -> dict[str, str]:
    return {"app": "aifactory-demo"}


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
