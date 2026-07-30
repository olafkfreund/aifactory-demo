"""Tests for the ``title_case`` text helper."""

from src.app.text import title_case


def test_empty_string_returns_empty_string():
    assert title_case("") == ""


def test_single_word_is_capitalized():
    assert title_case("hello") == "Hello"


def test_multiple_words_are_each_capitalized():
    assert title_case("hello world") == "Hello World"


def test_mixed_case_input_is_normalized():
    assert title_case("hELLo WoRLD") == "Hello World"


def test_extra_internal_spaces_are_collapsed():
    assert title_case("hello   world") == "Hello World"
