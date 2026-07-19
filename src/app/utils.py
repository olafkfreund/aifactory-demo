"""Utility functions for the aifactory-demo app."""


def gcd(a: int, b: int) -> int:
    """Calculate the greatest common divisor of two integers using the Euclidean algorithm.

    Args:
        a: First integer (can be negative)
        b: Second integer (can be negative)

    Returns:
        The greatest common divisor of a and b.

    Examples:
        >>> gcd(12, 8)
        4
        >>> gcd(17, 5)
        1
        >>> gcd(0, 5)
        5
        >>> gcd(-12, 8)
        4
        >>> gcd(0, 0)
        0
    """
    a, b = abs(a), abs(b)
    while b != 0:
        a, b = b, a % b
    return a
