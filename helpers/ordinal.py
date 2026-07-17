"""Ordinal number renderer helper."""


def ordinal(n: int) -> str:
    """Convert a number to its ordinal representation.

    Args:
        n: The number to convert to ordinal format.

    Returns:
        The ordinal representation of the number (e.g., '1st', '2nd', '3rd', '11th').

    Raises:
        TypeError: If n is not an integer.
    """
    if not isinstance(n, int):
        raise TypeError(f"ordinal() argument must be an integer, not {type(n).__name__}")

    # Handle negative numbers by using absolute value
    abs_n = abs(n)

    # Determine the suffix
    if abs_n % 100 in (11, 12, 13):
        suffix = "th"
    else:
        remainder = abs_n % 10
        if remainder == 1:
            suffix = "st"
        elif remainder == 2:
            suffix = "nd"
        elif remainder == 3:
            suffix = "rd"
        else:
            suffix = "th"

    return f"{n}{suffix}"
