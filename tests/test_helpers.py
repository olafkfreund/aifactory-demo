from src.app.helpers.reverse_string import reverse_string


def test_reverse_string_empty_string():
    """Test reverse_string with empty string."""
    assert reverse_string('') == ''


def test_reverse_string_single_character():
    """Test reverse_string with single character."""
    assert reverse_string('a') == 'a'


def test_reverse_string_simple_string():
    """Test reverse_string with simple string."""
    assert reverse_string('abc') == 'cba'


def test_reverse_string_hello():
    """Test reverse_string with 'hello'."""
    assert reverse_string('hello') == 'olleh'


def test_reverse_string_unicode():
    """Test reverse_string with unicode characters."""
    assert reverse_string('café') == 'éfac'


def test_reverse_string_spaces():
    """Test reverse_string with spaces."""
    assert reverse_string('hello world') == 'dlrow olleh'


def test_reverse_string_special_characters():
    """Test reverse_string with special characters."""
    assert reverse_string('a!b@c#') == '#c@b!a'


def test_reverse_string_numbers():
    """Test reverse_string with numbers."""
    assert reverse_string('12345') == '54321'


def test_reverse_string_mixed_content():
    """Test reverse_string with mixed alphanumeric and special characters."""
    assert reverse_string('test-123') == '321-tset'


def test_reverse_string_long_string():
    """Test reverse_string with long string."""
    original = 'a' * 1000
    assert reverse_string(original) == original


def test_reverse_string_repeated_characters():
    """Test reverse_string with repeated characters."""
    assert reverse_string('aaa') == 'aaa'


def test_reverse_string_palindrome():
    """Test reverse_string with palindrome string."""
    assert reverse_string('level') == 'level'
