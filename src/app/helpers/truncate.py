"""String truncation utilities."""


def truncate(s: str, n: int) -> str:
    """Truncate a string to a maximum length with ellipsis.

    Args:
        s: The string to truncate.
        n: The maximum length (including the ellipsis if truncation occurs).

    Returns:
        The original string if len(s) <= n, otherwise the first n-1 characters
        followed by an ellipsis character '…'.

    Examples:
        >>> truncate('hello', 10)
        'hello'
        >>> truncate('hello world', 5)
        'hell…'
    """
    if len(s) <= n:
        return s
    return s[: n - 1] + "…"
