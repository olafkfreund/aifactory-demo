"""Helper functions for the aifactory-demo application."""


def factorial(n: int) -> int:
    """Calculate the factorial of n.

    Args:
        n: Non-negative integer

    Returns:
        The factorial of n (n!)

    Raises:
        ValueError: If n is negative
    """
    if n < 0:
        raise ValueError("factorial() not defined for negative values")

    if n == 0:
        return 1

    result = 1
    for i in range(1, n + 1):
        result *= i
    return result
