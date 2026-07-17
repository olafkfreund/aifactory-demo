"""Text utility functions."""


def truncate(text: str, limit: int) -> str:
    """Truncate text to a specified limit with ellipsis.

    Args:
        text: The text to truncate.
        limit: The maximum length of the result. Must be >= 3.

    Returns:
        The original text if len(text) <= limit, otherwise the first
        (limit-3) characters followed by '...' for a total of exactly
        limit characters.

    Raises:
        ValueError: If limit < 3.
    """
    if limit < 3:
        raise ValueError("limit must be at least 3")

    if len(text) <= limit:
        return text

    return text[: limit - 3] + "..."
