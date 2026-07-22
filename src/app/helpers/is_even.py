"""Helper module for checking if a number is even."""


def is_even(n: int) -> bool:
    """
    Check if an integer is even.

    Args:
        n: An integer to check.

    Returns:
        True if n is even, False if n is odd.
    """
    return n % 2 == 0
