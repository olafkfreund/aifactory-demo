"""Utility functions for the aifactory-demo application."""


def clamp(value: float, low: float, high: float) -> float:
    """Clamp a value between low and high bounds.

    Args:
        value: The value to clamp.
        low: The minimum allowed value.
        high: The maximum allowed value.

    Returns:
        The value clamped to the [low, high] range.
    """
    return max(low, min(value, high))
