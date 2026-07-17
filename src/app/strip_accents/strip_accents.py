"""Strip accents function for replacing accented characters with ASCII equivalents."""

import unicodedata


def strip_accents(text: str) -> str:
    """
    Replace accented Latin characters with their ASCII base equivalents.

    Normalizes the input text using NFKD (Compatibility Decomposition) to
    separate accented characters from their base forms, then encodes to ASCII
    and decodes back to remove the accent marks. All non-ASCII diacritical
    marks are removed.

    Args:
        text: The text to process.

    Returns:
        The text with accents removed, or empty string if input is empty.

    Examples:
        >>> strip_accents("café")
        'cafe'
        >>> strip_accents("naïve")
        'naive'
        >>> strip_accents("résumé")
        'resume'
        >>> strip_accents("Zürich")
        'Zurich'
        >>> strip_accents("hello")
        'hello'
        >>> strip_accents("")
        ''
    """
    if not text:
        return ""

    # Normalize to NFKD (Compatibility Decomposition) form
    # This separates accented characters from their base forms
    normalized = unicodedata.normalize('NFKD', text)

    # Encode to ASCII, ignoring errors (dropping accents), then decode back
    # This removes all non-ASCII diacritical marks
    return normalized.encode('ascii', 'ignore').decode('ascii')
