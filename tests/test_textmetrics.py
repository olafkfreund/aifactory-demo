"""Unit tests for the pure-stdlib text metric helpers.

Covers word counting, reading-time estimation (including the ``wpm``
validation and rounding boundaries), and slugification across empty,
single/multi-word, punctuation, and unicode inputs.
"""

import pytest

from app.textmetrics import reading_time_minutes, slugify, word_count


# word_count -----------------------------------------------------------
def test_word_count_empty_is_zero():
    assert word_count("") == 0
    assert word_count("   \t\n ") == 0


def test_word_count_single_word():
    assert word_count("hello") == 1


def test_word_count_several_words_collapses_whitespace():
    assert word_count("the quick   brown\tfox\njumps") == 5


def test_word_count_counts_punctuation_tokens():
    assert word_count("hello, world!") == 2
    assert word_count("well-being counts as one") == 4


def test_word_count_handles_unicode():
    assert word_count("café résumé naïve") == 3
    assert word_count("日本語 の テスト") == 3


# reading_time_minutes -------------------------------------------------
def test_reading_time_empty_is_zero():
    assert reading_time_minutes("") == 0
    assert reading_time_minutes("   ") == 0


def test_reading_time_rounds_up_to_at_least_one_minute():
    assert reading_time_minutes("one two three", wpm=200) == 1


def test_reading_time_rounding_boundary_ceils():
    # Exactly wpm words -> 1 minute (no rounding up needed).
    assert reading_time_minutes(" ".join(["w"] * 200), wpm=200) == 1
    # One over the boundary rounds up to 2 minutes.
    assert reading_time_minutes(" ".join(["w"] * 201), wpm=200) == 2
    # Two full minutes exactly.
    assert reading_time_minutes(" ".join(["w"] * 400), wpm=200) == 2


def test_reading_time_respects_custom_wpm():
    assert reading_time_minutes(" ".join(["w"] * 10), wpm=5) == 2


def test_reading_time_wpm_zero_raises_valueerror():
    with pytest.raises(ValueError):
        reading_time_minutes("some words here", wpm=0)


def test_reading_time_wpm_negative_raises_even_for_empty_input():
    with pytest.raises(ValueError):
        reading_time_minutes("", wpm=-1)


# slugify --------------------------------------------------------------
def test_slugify_empty_is_empty():
    assert slugify("") == ""
    assert slugify("   ") == ""


def test_slugify_single_word_lowercased():
    assert slugify("Hello") == "hello"


def test_slugify_several_words_hyphenated():
    assert slugify("The Quick Brown Fox") == "the-quick-brown-fox"


def test_slugify_collapses_punctuation_and_strips_edges():
    assert slugify("  Hello, World!!  ") == "hello-world"
    assert slugify("foo___bar") == "foo-bar"
    assert slugify("a & b @ c") == "a-b-c"


def test_slugify_handles_unicode_letters():
    assert slugify("Café Résumé") == "café-résumé"
    assert slugify("日本語 テスト") == "日本語-テスト"
