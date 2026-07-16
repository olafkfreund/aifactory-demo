"""Text utility functions for string transformations."""

import re


def to_snake_case(text: str) -> str:
    """Convert CamelCase, space-separated, or hyphen-separated strings to snake_case.

    Handles multiple input formats:
    - CamelCase: "HelloWorld" -> "hello_world"
    - Space-separated: "hello world" -> "hello_world"
    - Hyphen-separated: "hello-world" -> "hello_world"
    - Mixed: "Hello World" -> "hello_world"
    - Empty string: "" -> ""

    Args:
        text: The input string to convert.

    Returns:
        The string converted to snake_case.
    """
    if not text:
        return ""

    # Replace hyphens and spaces with underscores
    text = re.sub(r"[-\s]+", "_", text)

    # Insert underscores before uppercase letters that follow lowercase letters or numbers
    text = re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", text)

    # Insert underscores between consecutive uppercase letters and a following lowercase letter
    # E.g., "HTTPServer" -> "HTTP_Server"
    text = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1_\2", text)

    # Convert to lowercase
    return text.lower()
