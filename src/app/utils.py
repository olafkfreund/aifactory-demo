"""Utility functions for aifactory-demo."""


def gcd(a: int, b: int) -> int:
    """
    Compute the greatest common divisor of two integers using the Euclidean algorithm.

    Args:
        a: First integer
        b: Second integer

    Returns:
        The greatest common divisor of a and b

    Examples:
        >>> gcd(12, 8)
        4
        >>> gcd(17, 5)
        1
        >>> gcd(0, 5)
        5
        >>> gcd(-12, 8)
        4
    """
    a, b = abs(a), abs(b)

    while b != 0:
        a, b = b, a % b

    return a
