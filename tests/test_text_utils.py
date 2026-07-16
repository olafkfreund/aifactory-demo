"""Unit tests for text_utils module."""

from src.app.text_utils import to_snake_case


def test_empty_string_returns_empty():
    """Empty string returns empty."""
    assert to_snake_case("") == ""


def test_camel_case_conversion():
    """CamelCase: HelloWorld -> hello_world."""
    assert to_snake_case("HelloWorld") == "hello_world"


def test_already_snake_case_remains_unchanged():
    """Already snake_case remains unchanged."""
    assert to_snake_case("hello_world") == "hello_world"


def test_space_separated_conversion():
    """Space-separated: hello world -> hello_world."""
    assert to_snake_case("hello world") == "hello_world"


def test_hyphen_separated_conversion():
    """Hyphen-separated: hello-world -> hello_world."""
    assert to_snake_case("hello-world") == "hello_world"


def test_mixed_case_with_spaces():
    """Mixed case with spaces: Hello World -> hello_world."""
    assert to_snake_case("Hello World") == "hello_world"


def test_single_word_remains_lowercase():
    """Single word remains lowercase."""
    assert to_snake_case("Hello") == "hello"
    assert to_snake_case("world") == "world"


def test_numbers_are_preserved():
    """Numbers are preserved."""
    assert to_snake_case("Hello123World") == "hello123_world"
    assert to_snake_case("HTTP2Protocol") == "http2_protocol"


def test_consecutive_capitals():
    """Consecutive capitals: HTTPServer -> http_server."""
    assert to_snake_case("HTTPServer") == "http_server"
    assert to_snake_case("XMLParser") == "xml_parser"


def test_single_capital_letter():
    """Single capital letter."""
    assert to_snake_case("A") == "a"
    assert to_snake_case("ABC") == "abc"


def test_multiple_spaces_and_hyphens():
    """Multiple consecutive spaces and hyphens are collapsed."""
    assert to_snake_case("hello  world") == "hello_world"
    assert to_snake_case("hello--world") == "hello_world"
    assert to_snake_case("hello- -world") == "hello_world"


def test_leading_and_trailing_spaces():
    """Leading and trailing spaces are trimmed."""
    assert to_snake_case("  hello world  ") == "hello_world"
    assert to_snake_case("  HelloWorld  ") == "hello_world"


def test_complex_mixed_inputs():
    """Complex mixed inputs."""
    assert to_snake_case("GetHTTPResponseCode") == "get_http_response_code"
    assert to_snake_case("get_HTTP_response_code") == "get_http_response_code"
    assert to_snake_case("Get HTTP Response Code") == "get_http_response_code"
