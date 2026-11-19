# Acceptance criterion (AC#1):
#   slugify("Hello, World!") == "hello-world"
# slugify lowercases text and collapses punctuation/space runs into single
# hyphens so 'Hello, World!' becomes 'hello-world'.

from app.slugify import slugify


def test_slugify_basic_punctuation_to_hyphen_returns_hello_world():
    assert slugify("Hello, World!") == "hello-world"
