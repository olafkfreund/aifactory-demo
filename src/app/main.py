from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from . import __version__
from .slugify import slugify

app = FastAPI(title="aifactory-demo", version=__version__)


class SlugRequest(BaseModel):
    text: str


class SlugResponse(BaseModel):
    slug: str


@app.get("/")
async def root() -> dict[str, str]:
    return {"app": "aifactory-demo"}


@app.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/slug")
async def create_slug(request: SlugRequest) -> SlugResponse:
    slug = slugify(request.text)
    if not slug:
        raise HTTPException(
            status_code=422,
            detail="text did not produce a valid slug",
        )
    return SlugResponse(slug=slug)
