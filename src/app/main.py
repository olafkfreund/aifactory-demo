from fastapi import FastAPI
from pydantic import BaseModel

from . import __version__
from .text_helpers import word_count

app = FastAPI(title="aifactory-demo", version=__version__)


class WordCountRequest(BaseModel):
    """Request body for word count endpoint."""

    text: str


@app.get("/")
async def root() -> dict[str, str]:
    return {"app": "aifactory-demo"}


@app.post("/word-count")
async def count_words(request: WordCountRequest) -> dict[str, int]:
    """Count the number of whitespace-separated words in the provided text.

    Args:
        request: A request object containing the text to count.

    Returns:
        A dictionary with the word count.
    """
    count = word_count(request.text)
    return {"word_count": count}
