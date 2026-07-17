import re


def is_valid_slug(s: str) -> bool:
    """
    Validate if a string is a valid slug.

    A valid slug:
    - Contains only lowercase letters, numbers, and hyphens
    - Does not start or end with a hyphen
    - Does not have consecutive hyphens
    - Is not empty

    Args:
        s: The string to validate

    Returns:
        True if the string is a valid slug, False otherwise
    """
    if not isinstance(s, str):
        return False

    if not s:
        return False

    if s.startswith("-") or s.endswith("-"):
        return False

    if "--" in s:
        return False

    pattern = r"^[a-z0-9]([a-z0-9-]*[a-z0-9])?$"
    return bool(re.match(pattern, s))
