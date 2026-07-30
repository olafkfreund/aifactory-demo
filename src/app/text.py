"""Small text helpers for aifactory-demo."""


def title_case(s: str) -> str:
    """Title-case a string.

    Upper-cases the first letter of each whitespace-separated word and
    lower-cases the remaining letters. Returns an empty string for empty
    input. Uses only the Python standard library.
    """
    return " ".join(word.capitalize() for word in s.split())
