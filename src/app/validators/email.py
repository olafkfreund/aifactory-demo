"""Email validation for aifactory-demo."""

import re


def is_valid_email(s: str) -> bool:
    """
    Validate if a string is a valid email.

    A valid email:
    - Has at least one character before @
    - Has a valid domain after @
    - Has a valid top-level domain (.tld)
    - Does not have consecutive dots
    - Does not have spaces

    Args:
        s: The string to validate

    Returns:
        True if the string is a valid email, False otherwise
    """
    # Type check - return False for non-strings
    if not isinstance(s, str):
        return False

    # Strip whitespace
    s = s.strip()

    # Empty check
    if not s:
        return False

    # Check for consecutive dots
    if ".." in s:
        return False

    # Simple but effective email regex pattern
    # Matches basic email format: localpart@domain.tld
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"

    # Return True/False instead of raising
    if not re.match(pattern, s):
        return False

    return True
