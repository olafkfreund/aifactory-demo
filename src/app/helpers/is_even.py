"""Pure-function helper for checking if a number is even."""


def is_even(n: int) -> bool:
    """
    Determine if an integer is even.

    Args:
        n: An integer to check.

    Returns:
        True if n is even, False if n is odd.

    Examples:
        >>> is_even(0)
        True
        >>> is_even(4)
        True
        >>> is_even(-2)
        True
        >>> is_even(3)
        False
        >>> is_even(-7)
        False
    """
    return n % 2 == 0
