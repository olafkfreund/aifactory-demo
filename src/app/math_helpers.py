"""Mathematical helper functions for aifactory-demo.

This module provides pure mathematical utility functions used throughout
the aifactory-demo service.
"""


def factorial(n: int) -> int:
    """Compute the factorial of n.

    Returns n! (n factorial) for non-negative integers.
    factorial(0) returns 1 by definition.

    Args:
        n: A non-negative integer.

    Returns:
        The factorial of n as an integer.

    Raises:
        ValueError: If n is negative.

    Examples:
        >>> factorial(0)
        1
        >>> factorial(5)
        120
        >>> factorial(10)
        3628800
    """
    if n < 0:
        raise ValueError(f"factorial() not defined for negative values (n={n})")

    if n == 0 or n == 1:
        return 1

    result = 1
    for i in range(2, n + 1):
        result *= i
    return result
