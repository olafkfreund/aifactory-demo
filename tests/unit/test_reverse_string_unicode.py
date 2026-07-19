"""AC#1: The feature works as described: Add a reverse_string(s) helper.

The helper's docstring states that unicode characters are handled correctly, so
these tests prove that reverse_string reverses non-ASCII input by *code point*
(e.g. 'café' in composed form, 'café' -> 'éfac') without
splitting or mangling multi-byte characters.

Unicode literals are written with explicit escapes so the assertions do not
depend on the normalisation form this source file happens to be saved in.
"""

import unicodedata

import pytest

from app.helpers.reverse_string import reverse_string


@pytest.mark.parametrize(
    "text,expected",
    [
        ("café", "éfac"),
        ("naïve", "evïan"),
        ("über", "rebü"),
        ("你好世界", "界世好你"),
        ("αβγ", "γβα"),
        ("مرحبا", "ابحرم"),
        ("\U0001f600\U0001f680", "\U0001f680\U0001f600"),
        ("aéb", "béa"),
    ],
    ids=[
        "cafe-composed-acute",
        "naive-diaeresis",
        "uber-umlaut",
        "cjk-hanzi",
        "greek",
        "arabic-rtl",
        "astral-emoji",
        "mixed-ascii-and-accent",
    ],
)
def test_reverse_string_non_ascii_reverses_by_code_point(text, expected):
    """Non-ASCII input is reversed code point by code point."""
    assert reverse_string(text) == expected


def test_reverse_string_preserves_code_point_multiset():
    """Reversing never drops, duplicates, or splits a multi-byte character."""
    text = "café 你好 \U0001f600"

    result = reverse_string(text)

    assert len(result) == len(text)
    assert sorted(result) == sorted(text)


def test_reverse_string_non_ascii_round_trips():
    """Reversing twice restores the original non-ASCII string exactly."""
    text = "éèê世\U0001f680"

    assert reverse_string(reverse_string(text)) == text


def test_reverse_string_does_not_produce_replacement_or_surrogates():
    """Output has no replacement chars or lone surrogates (nothing mangled)."""
    text = "café \U0001f600 你好"

    result = reverse_string(text)

    assert "�" not in result
    assert all(unicodedata.category(ch) != "Cs" for ch in result)
    assert result.encode("utf-8").decode("utf-8") == result


def test_reverse_string_decomposed_form_reverses_code_points():
    """NFD input (base char + combining mark) is reversed by code point."""
    decomposed = unicodedata.normalize("NFD", "café")
    assert decomposed == "café"

    assert reverse_string(decomposed) == "́efac"


def test_reverse_string_astral_char_is_not_split_into_surrogate_halves():
    """A single astral (4-byte UTF-8) char survives reversal intact."""
    text = "a\U0001f600b"

    result = reverse_string(text)

    assert result == "b\U0001f600a"
    assert len(result) == 3
