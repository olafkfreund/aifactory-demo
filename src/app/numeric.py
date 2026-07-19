"""Numeric utilities for aifactory-demo."""


def clamp(value: float, low: float, high: float) -> float:
    """Constrain a value to an inclusive range [low, high].

    Args:
        value: The value to constrain.
        low: The lower bound (inclusive).
        high: The upper bound (inclusive).

    Returns:
        The value constrained to [low, high].

    Raises:
        ValueError: If low > high.
    """
    if low > high:
        raise ValueError(f"low ({low}) must be <= high ({high})")

    if value < low:
        return low
    if value > high:
        return high
    return value
