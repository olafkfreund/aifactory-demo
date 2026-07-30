"""Pydantic v2 request/response models for the link shortener service."""

from pydantic import BaseModel


class ShortenRequest(BaseModel):
    url: str


class LinkView(BaseModel):
    code: str
    url: str


class LinkStats(BaseModel):
    code: str
    url: str
    hits: int
