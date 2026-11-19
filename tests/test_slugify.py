"""Unit tests for the pure-stdlib slugify helper.

Covers basic punctuation handling, accent folding via NFKD normalization,
collapsing of multiple spaces/symbols into single hyphens, ``max_length``
truncation (word-boundary cuts, exact fits, and the single-character hard
cut), unlimited length (``max_length=None``), empty/all-symbol input, and
``max_length`` validation for zero and negative values.
"""

import pytest

from app.slugify import slugify


# slugify: basic punctuation --------------------------------------------
def test_slugify_basic_punctuation():
    assert slugify("Hello, World!!") == "hello-world"
    assert slugify("The Quick Brown Fox") == "the-quick-brown-fox"


# slugify: accent folding ------------------------------------------------
def test_slugify_folds_accents():
    assert slugify("Café Résumé") == "cafe-resume"
    assert slugify("Crème Brûlée!") == "creme-brulee"


# slugify: collapsing symbols/whitespace ---------------------------------
def test_slugify_collapses_multiple_spaces_and_symbols():
    assert slugify("foo___bar") == "foo-bar"
    assert slugify("a & b @ c") == "a-b-c"
    assert slugify("  Hello,    World!!  ") == "hello-world"


# slugify: empty / all-symbol input ---------------------------------------
def test_slugify_empty_string_is_empty():
    assert slugify("") == ""


def test_slugify_all_symbol_string_is_empty():
    assert slugify("@@@###!!!") == ""


# slugify: max_length word-boundary cut ------------------------------------
def test_slugify_max_length_cuts_on_word_boundary():
    # Full slug is "the-quick-brown-fox"; cutting at 8 chars lands mid-word
    # ("the-quic"), so it trims back to the previous hyphen boundary.
    assert slugify("the quick brown fox", max_length=8) == "the"


def test_slugify_max_length_exact_boundary_needs_no_trim():
    # Cutting at 9 chars lands exactly on a hyphen ("the-quick"), so no
    # further trimming is required.
    assert slugify("the quick brown fox", max_length=9) == "the-quick"


# slugify: max_length exact-fit length -------------------------------------
def test_slugify_max_length_exact_fit_returns_full_slug():
    slug = "the-quick-brown-fox"
    assert slugify("the quick brown fox", max_length=len(slug)) == slug


# slugify: max_length=1 hard cut -------------------------------------------
def test_slugify_max_length_one_hard_cuts_first_word():
    assert slugify("the quick brown fox", max_length=1) == "t"


# slugify: max_length=None is unlimited -------------------------------------
def test_slugify_max_length_none_is_unlimited():
    long_text = " ".join(["word"] * 50)
    assert slugify(long_text, max_length=None) == slugify(long_text)


# slugify: max_length validation --------------------------------------------
def test_slugify_max_length_zero_raises_valueerror():
    with pytest.raises(ValueError):
        slugify("hello world", max_length=0)


def test_slugify_max_length_negative_raises_valueerror():
    with pytest.raises(ValueError):
        slugify("hello world", max_length=-1)
