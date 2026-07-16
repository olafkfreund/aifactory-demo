"""String utility functions for common string operations."""

__all__ = ["to_upper", "to_lower"]


def to_upper(s: str) -> str:
    """Convert a string to uppercase.

    Args:
        s: The string to convert.

    Returns:
        The input string converted to uppercase.
    """
    return s.upper()


def to_lower(s: str) -> str:
    """Convert a string to lowercase.

    Args:
        s: The string to convert.

    Returns:
        The input string converted to lowercase.
    """
    return s.lower()
