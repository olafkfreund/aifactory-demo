import sqlite3

from fastapi import FastAPI, HTTPException

from . import __version__

app = FastAPI(title="aifactory-demo", version=__version__)


@app.get("/")
async def root() -> dict[str, str]:
    return {"app": "aifactory-demo"}


@app.get("/healthz/db")
async def healthz_db() -> dict[str, str]:
    try:
        with sqlite3.connect(":memory:") as con:
            con.execute("SELECT 1")
    except Exception as exc:
        raise HTTPException(status_code=503, detail={"status": "error", "db": str(exc)}) from exc
    return {"status": "ok", "db": "ok"}
