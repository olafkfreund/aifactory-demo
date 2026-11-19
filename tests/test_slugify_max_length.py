# Acceptance criterion (AC#4):
# slugify("the quick brown fox jumps", max_length=15) == "the-quick-brown"
# The result must be cut on a word boundary (a hyphen boundary), have no
# trailing hyphen, and have length <= 15.

from app.slugify import slugify


def test_slugify_max_length_cuts_on_word_boundary():
    assert slugify("the quick brown fox jumps", max_length=15) == "the-quick-brown"


def test_slugify_max_length_result_within_limit():
    result = slugify("the quick brown fox jumps", max_length=15)
    assert len(result) <= 15


def test_slugify_max_length_no_trailing_hyphen():
    result = slugify("the quick brown fox jumps", max_length=15)
    assert not result.endswith("-")
