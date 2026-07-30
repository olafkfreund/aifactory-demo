"""Pure-stdlib ordinal number formatting.

A single dependency-free helper for turning a non-negative integer into its
English ordinal string (``1`` -> ``"1st"``, ``2`` -> ``"2nd"``, ...). No
imports beyond the standard library are needed.
"""

from __future__ import annotations


def ordinal(n: int) -> str:
    """Return the English ordinal string for a non-negative integer ``n``.

    ``n`` must be zero or positive; a negative value raises
    :class:`ValueError`.

    The suffix is ``"th"`` for the teens (``11``, ``12``, ``13`` and any
    number ending in them, e.g. ``111``), otherwise it is chosen from the
    final digit: ``1`` -> ``"st"``, ``2`` -> ``"nd"``, ``3`` -> ``"rd"``, and
    ``"th"`` for everything else.
    """
    if n < 0:
        raise ValueError(f"n must be non-negative, got {n}")
    if 11 <= n % 100 <= 13:
        suffix = "th"
    else:
        suffix = {1: "st", 2: "nd", 3: "rd"}.get(n % 10, "th")
    return f"{n}{suffix}"
