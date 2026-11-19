# Criterion (AC#4 + spec body): a first word longer than max_length is
# hard-cut to exactly max_length; max_length <= 0 raises ValueError;
# empty or all-symbol input returns "".

import pytest

from app.slugify import slugify


@pytest.mark.parametrize(
    "text,max_length,expected",
    [
        ("supercalifragilistic", 5, "super"),
        ("extraordinary", 5, "extra"),
        ("hello", 1, "h"),
    ],
    ids=["supercali-to-5", "extraordinary-to-5", "hello-to-1"],
)
def test_slugify_first_word_longer_than_max_length_is_hard_cut(
    text, max_length, expected
):
    result = slugify(text, max_length=max_length)
    assert result == expected
    assert len(result) == max_length


@pytest.mark.parametrize(
    "max_length",
    [0, -1, -5],
    ids=["zero", "minus-one", "minus-five"],
)
def test_slugify_non_positive_max_length_raises_value_error(max_length):
    with pytest.raises(ValueError):
        slugify("the quick brown fox", max_length=max_length)


@pytest.mark.parametrize(
    "text",
    ["", "   ", "!!!", "  --  ", "&*^%$#@"],
    ids=["empty", "spaces", "bangs", "dashes-spaces", "symbols"],
)
def test_slugify_empty_or_all_symbol_input_returns_empty_string(text):
    assert slugify(text) == ""
