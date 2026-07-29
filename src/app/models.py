"""Pydantic v2 request/response models for the inventory reservation service."""

from pydantic import BaseModel, Field


class ItemCreate(BaseModel):
    sku: str
    total: int = Field(ge=0)


class ItemView(BaseModel):
    sku: str
    total: int
    reserved: int
    available: int


class ReservationCreate(BaseModel):
    quantity: int = Field(ge=1)
    ttl_seconds: int = Field(ge=1, le=3600)


class ReservationView(BaseModel):
    id: str
    sku: str
    quantity: int
    state: str
    ttl_seconds: int
