"""Pydantic v2 request/response models for the link shortener service."""

from pydantic import BaseModel, field_validator


class ShortenRequest(BaseModel):
    url: str

    @field_validator("url")
    @classmethod
    def url_must_be_http_or_https(cls, v: str) -> str:
        """Reject any URL whose scheme is not http or https."""
        lowered = v.strip().lower()
        if not (lowered.startswith("http://") or lowered.startswith("https://")):
            raise ValueError("url must use http or https scheme")
        return v


class LinkView(BaseModel):
    code: str
    url: str


class LinkStats(BaseModel):
    code: str
    url: str
    hits: int
