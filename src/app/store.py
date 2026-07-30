"""Thread-safe in-memory inventory + reservation store.

All state lives in process memory and is guarded by a single
``threading.Lock`` so reserve/confirm/cancel operations are atomic
(important for the concurrent-reservation acceptance criterion).

The store raises :class:`NotFound` / :class:`Conflict` so the HTTP layer
can translate them into 404 / 409 responses.
"""

from __future__ import annotations

import threading
import time
import uuid
from collections.abc import Callable
from dataclasses import dataclass


class StoreError(Exception):
    """Base class for domain errors raised by the store."""


class NotFound(StoreError):
    """Raised when a requested sku or reservation does not exist."""


class Conflict(StoreError):
    """Raised when an operation conflicts with current state.

    Examples: reserving more than is available, or confirming an
    expired/cancelled reservation.
    """


# Reservation lifecycle states.
ACTIVE = "active"
CONFIRMED = "confirmed"
CANCELLED = "cancelled"
EXPIRED = "expired"


@dataclass
class _Item:
    sku: str
    total: int


@dataclass
class _Reservation:
    id: str
    sku: str
    quantity: int
    ttl_seconds: int
    created_at: float
    state: str = ACTIVE


class InventoryStore:
    """In-memory store for items and their reservations."""

    def __init__(self, time_fn: Callable[[], float] = time.time) -> None:
        self._items: dict[str, _Item] = {}
        self._reservations: dict[str, _Reservation] = {}
        self._lock = threading.Lock()
        # Injectable clock so tests can control expiry deterministically.
        self._time_fn = time_fn

    # -- helpers (call only while holding the lock) ----------------------

    def _is_expired(self, res: _Reservation, now: float) -> bool:
        return now >= res.created_at + res.ttl_seconds

    def _effective_state(self, res: _Reservation, now: float) -> str:
        if res.state == ACTIVE and self._is_expired(res, now):
            return EXPIRED
        return res.state

    def _reserved_qty(self, sku: str, now: float) -> int:
        return sum(
            res.quantity
            for res in self._reservations.values()
            if res.sku == sku and res.state == ACTIVE and not self._is_expired(res, now)
        )

    # -- items -----------------------------------------------------------

    def create_item(self, sku: str, total: int) -> dict:
        with self._lock:
            self._items[sku] = _Item(sku=sku, total=total)
            now = self._time_fn()
            return self._item_view(sku, now)

    def get_item(self, sku: str) -> dict:
        with self._lock:
            now = self._time_fn()
            return self._item_view(sku, now)

    def _item_view(self, sku: str, now: float) -> dict:
        item = self._items.get(sku)
        if item is None:
            raise NotFound(f"unknown sku: {sku}")
        reserved = self._reserved_qty(sku, now)
        return {
            "sku": item.sku,
            "total": item.total,
            "reserved": reserved,
            "available": item.total - reserved,
        }

    # -- reservations ----------------------------------------------------

    def reserve(self, sku: str, quantity: int, ttl_seconds: int) -> str:
        with self._lock:
            item = self._items.get(sku)
            if item is None:
                raise NotFound(f"unknown sku: {sku}")
            now = self._time_fn()
            available = item.total - self._reserved_qty(sku, now)
            if quantity > available:
                raise Conflict(
                    f"insufficient stock for {sku}: "
                    f"requested {quantity}, available {available}"
                )
            rid = uuid.uuid4().hex
            self._reservations[rid] = _Reservation(
                id=rid,
                sku=sku,
                quantity=quantity,
                ttl_seconds=ttl_seconds,
                created_at=now,
            )
            return rid

    def get_reservation(self, reservation_id: str) -> dict:
        with self._lock:
            now = self._time_fn()
            return self._reservation_view(reservation_id, now)

    def _reservation_view(self, reservation_id: str, now: float) -> dict:
        res = self._reservations.get(reservation_id)
        if res is None:
            raise NotFound(f"unknown reservation: {reservation_id}")
        return {
            "id": res.id,
            "sku": res.sku,
            "quantity": res.quantity,
            "state": self._effective_state(res, now),
            "ttl_seconds": res.ttl_seconds,
        }

    def confirm(self, reservation_id: str) -> dict:
        with self._lock:
            res = self._reservations.get(reservation_id)
            if res is None:
                raise NotFound(f"unknown reservation: {reservation_id}")
            now = self._time_fn()

            # Idempotent: confirming an already-confirmed reservation is a no-op.
            if res.state == CONFIRMED:
                return self._reservation_view(reservation_id, now)

            if res.state == CANCELLED:
                raise Conflict("reservation already cancelled")

            if self._is_expired(res, now):
                raise Conflict("reservation has expired")

            item = self._items.get(res.sku)
            if item is None:  # pragma: no cover - defensive
                raise NotFound(f"unknown sku: {res.sku}")

            item.total -= res.quantity
            res.state = CONFIRMED
            return self._reservation_view(reservation_id, now)

    def cancel(self, reservation_id: str) -> dict:
        with self._lock:
            res = self._reservations.get(reservation_id)
            if res is None:
                raise NotFound(f"unknown reservation: {reservation_id}")
            now = self._time_fn()
            # Releasing simply flips the state; an active reservation stops
            # contributing to reserved. Confirmed/cancelled are left as-is.
            if res.state == ACTIVE:
                res.state = CANCELLED
            return self._reservation_view(reservation_id, now)
