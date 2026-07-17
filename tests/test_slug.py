from src.app.validators.slug import is_valid_slug


def test_valid_slug_simple():
    assert is_valid_slug("hello") is True


def test_valid_slug_with_numbers():
    assert is_valid_slug("hello123") is True


def test_valid_slug_with_hyphens():
    assert is_valid_slug("hello-world") is True


def test_valid_slug_single_char():
    assert is_valid_slug("a") is True


def test_valid_slug_single_number():
    assert is_valid_slug("1") is True


def test_valid_slug_complex():
    assert is_valid_slug("my-awesome-slug-123") is True


def test_invalid_slug_empty():
    assert is_valid_slug("") is False


def test_invalid_slug_starts_with_hyphen():
    assert is_valid_slug("-hello") is False


def test_invalid_slug_ends_with_hyphen():
    assert is_valid_slug("hello-") is False


def test_invalid_slug_consecutive_hyphens():
    assert is_valid_slug("hello--world") is False


def test_invalid_slug_uppercase():
    assert is_valid_slug("Hello") is False


def test_invalid_slug_spaces():
    assert is_valid_slug("hello world") is False


def test_invalid_slug_special_chars():
    assert is_valid_slug("hello@world") is False


def test_invalid_slug_underscore():
    assert is_valid_slug("hello_world") is False


def test_invalid_slug_non_string():
    assert is_valid_slug(123) is False
