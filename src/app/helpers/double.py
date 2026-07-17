"""Double utility function with input validation."""


def double(n):
    """
    Return double the value of the input.

    Args:
        n: A numeric value (int or float)

    Returns:
        The input value multiplied by 2

    Raises:
        TypeError: If the input is not numeric (int or float)
    """
    if not isinstance(n, (int, float)) or isinstance(n, bool):
        raise TypeError(f"double() requires a numeric value (int or float), got {type(n).__name__}")
    return n * 2
