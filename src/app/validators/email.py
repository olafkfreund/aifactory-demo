"""Email validation for aifactory-demo."""

import re


class InvalidEmailError(ValueError):
    """Raised when an email address is invalid."""

    pass


def validate_email(email: str) -> str:
    """
    Validate an email address.

    Args:
        email: The email address to validate.

    Returns:
        The validated email address (lowercased).

    Raises:
        InvalidEmailError: If the email address is invalid.
    """
    if not isinstance(email, str):
        raise InvalidEmailError(f"Email must be a string, got {type(email).__name__}")

    email = email.strip()

    if not email:
        raise InvalidEmailError("Email cannot be empty")

    # Check for consecutive dots
    if ".." in email:
        raise InvalidEmailError(f"Invalid email format: {email}")

    # Simple but effective email regex pattern
    # Matches basic email format: localpart@domain.tld
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"

    if not re.match(pattern, email):
        raise InvalidEmailError(f"Invalid email format: {email}")

    return email.lower()
