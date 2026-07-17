"""Duration formatting utilities."""


def human_duration(seconds: int | float) -> str:
    """
    Convert seconds to a human-readable duration string.

    Args:
        seconds: Number of seconds to convert.

    Returns:
        A human-readable duration string (e.g., "2h 5m 2s").

    Examples:
        >>> human_duration(7502)
        '2h 5m 2s'
        >>> human_duration(125)
        '2m 5s'
        >>> human_duration(45)
        '45s'
    """
    seconds = int(seconds)

    if seconds < 0:
        raise ValueError("Duration cannot be negative")

    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60

    parts = []

    if hours > 0:
        parts.append(f"{hours}h")

    if minutes > 0:
        parts.append(f"{minutes}m")

    if secs > 0 or not parts:
        parts.append(f"{secs}s")

    return " ".join(parts)
