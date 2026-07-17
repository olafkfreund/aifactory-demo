"""Duration formatter helper."""


def human_duration(seconds: float) -> str:
    """Convert seconds to a human-readable duration string.

    Args:
        seconds: The number of seconds to convert (can be float or int).

    Returns:
        A human-readable string like '2h 5m 2s', with only non-zero components.

    Raises:
        ValueError: If seconds is negative.

    Examples:
        >>> human_duration(7502)
        '2h 5m 2s'
        >>> human_duration(125)
        '2m 5s'
        >>> human_duration(45)
        '45s'
        >>> human_duration(0)
        '0s'
        >>> human_duration(3600)
        '1h'
    """
    # Convert to integer (rounding down for float inputs)
    total_seconds = int(seconds)

    if total_seconds < 0:
        raise ValueError("Duration cannot be negative")

    # Calculate hours, minutes, and seconds
    hours = total_seconds // 3600
    remaining = total_seconds % 3600
    minutes = remaining // 60
    secs = remaining % 60

    # Build the result string with only non-zero components
    parts = []
    if hours > 0:
        parts.append(f"{hours}h")
    if minutes > 0:
        parts.append(f"{minutes}m")
    if secs > 0 or not parts:  # Always show seconds if it's the only component or if it's non-zero
        parts.append(f"{secs}s")

    return " ".join(parts)
