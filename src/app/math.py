"""Numeric helper functions for aifactory-demo."""


def clamp(value: float, low: float, high: float) -> float:
    """Clamp value to the inclusive range [low, high].

    Args:
        value: The numeric value to clamp.
        low: The lower bound of the range (inclusive).
        high: The upper bound of the range (inclusive).

    Returns:
        The clamped value, constrained to [low, high].

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
    return max(low, min(high, value))
