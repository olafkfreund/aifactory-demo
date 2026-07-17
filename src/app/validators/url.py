"""URL validation for aifactory-demo."""

import re


def is_valid_url(s: str) -> bool:
    """
    Validate if a string is a valid URL.

    A valid URL:
    - Starts with http:// or https://
    - Has a valid domain name
    - Does not contain spaces
    - Does not contain invalid characters

    Args:
        s: The string to validate

    Returns:
        True if the string is a valid URL, False otherwise
    """
    if not isinstance(s, str):
        return False

    if not s:
        return False

    # Check if URL starts with http:// or https://
    if not (s.startswith("http://") or s.startswith("https://")):
        return False

    # Remove the protocol for further validation
    url_without_protocol = s.split("://", 1)[1] if "://" in s else s

    if not url_without_protocol:
        return False

    # Check for spaces
    if " " in s:
        return False

    # URL pattern: domain with optional port, path, query, and fragment
    # Matches: domain.tld with optional :port, path, query, and fragment
    pattern = r"^https?://[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*(?::\d+)?(/[^\s]*)?(\?[^\s]*)?(?:#[^\s]*)?$"

    return bool(re.match(pattern, s))
