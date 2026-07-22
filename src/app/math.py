"""Mathematical helper functions for aifactory-demo."""


def clamp(value: float, low: float, high: float) -> float:
    """Constrain value to the inclusive range [low, high].

    Args:
        value: The value to clamp.
        low: The lower bound (inclusive).
        high: The upper bound (inclusive).

    Returns:
        The value constrained to [low, high].

    Raises:
        ValueError: If low > high.

    Examples:
        >>> clamp(5, 0, 10)
        5
        >>> clamp(-3, 0, 10)
        0
        >>> clamp(99, 0, 10)
        10
        >>> clamp(7.5, 0, 10)
        7.5
    """
    if low > high:
        raise ValueError(f"low ({low}) cannot be greater than high ({high})")

    if value < low:
        return low
    if value > high:
        return high
    return value
