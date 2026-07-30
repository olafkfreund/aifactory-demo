"""FastAPI router for the link shortener service.

Mount this router in the main application with:
    app.include_router(links_router)
    app.add_exception_handler(LinkNotFound, _link_not_found_handler)
"""

from fastapi import APIRouter
from fastapi.responses import RedirectResponse

from .link_models import LinkStats, LinkView, ShortenRequest
from .link_store import link_store

links_router = APIRouter()


@links_router.post("/links", response_model=LinkView, status_code=201)
async def create_link(body: ShortenRequest) -> dict:
    return link_store.create_link(body.url)


@links_router.get("/links/{code}", response_model=LinkView)
async def get_link(code: str) -> dict:
    return link_store.get_link(code)


@links_router.get("/links/{code}/stats", response_model=LinkStats)
async def get_link_stats(code: str) -> dict:
    return link_store.get_link_stats(code)


@links_router.get("/r/{code}")
async def redirect_link(code: str) -> RedirectResponse:
    url = link_store.record_hit(code)
    return RedirectResponse(url=url, status_code=307)


@links_router.delete("/links/{code}", status_code=204)
async def delete_link(code: str) -> None:
    link_store.delete_link(code)
