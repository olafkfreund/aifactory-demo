"""Tests for URL validator."""

from src.app.validators.url import is_valid_url


def test_valid_url_http():
    """Test validation of a simple HTTP URL."""
    assert is_valid_url("http://example.com") is True


def test_valid_url_https():
    """Test validation of a simple HTTPS URL."""
    assert is_valid_url("https://example.com") is True


def test_valid_url_with_www():
    """Test validation of a URL with www."""
    assert is_valid_url("https://www.example.com") is True


def test_valid_url_with_subdomain():
    """Test validation of a URL with subdomain."""
    assert is_valid_url("https://api.example.co.uk") is True


def test_valid_url_with_path():
    """Test validation of a URL with path."""
    assert is_valid_url("https://example.com/path/to/resource") is True


def test_valid_url_with_query():
    """Test validation of a URL with query parameters."""
    assert is_valid_url("https://example.com/search?q=hello") is True


def test_valid_url_with_fragment():
    """Test validation of a URL with fragment."""
    assert is_valid_url("https://example.com/page#section") is True


def test_valid_url_with_path_and_query():
    """Test validation of a URL with path and query."""
    assert is_valid_url("https://example.com/search?q=hello&lang=en") is True


def test_valid_url_with_path_query_fragment():
    """Test validation of a URL with path, query, and fragment."""
    assert is_valid_url("https://example.com/page?id=123#top") is True


def test_valid_url_with_numbers_in_domain():
    """Test validation of a URL with numbers in domain."""
    assert is_valid_url("https://example123.com") is True


def test_valid_url_with_hyphen_in_domain():
    """Test validation of a URL with hyphen in domain."""
    assert is_valid_url("https://my-example.com") is True


def test_valid_url_with_hyphen_in_subdomain():
    """Test validation of a URL with hyphen in subdomain."""
    assert is_valid_url("https://my-api.example.com") is True


def test_valid_url_with_port():
    """Test validation of a URL with port number."""
    assert is_valid_url("https://example.com:8080") is True


def test_valid_url_with_port_and_path():
    """Test validation of a URL with port and path."""
    assert is_valid_url("https://example.com:8080/api/v1") is True


def test_valid_url_localhost():
    """Test validation of localhost URL."""
    assert is_valid_url("http://localhost") is True


def test_valid_url_localhost_with_port():
    """Test validation of localhost URL with port."""
    assert is_valid_url("http://localhost:3000") is True


def test_valid_url_localhost_with_path():
    """Test validation of localhost URL with path."""
    assert is_valid_url("http://localhost:3000/api") is True


def test_valid_url_ip_address():
    """Test validation of URL with IP address."""
    assert is_valid_url("http://192.168.1.1") is True


def test_valid_url_ip_with_port():
    """Test validation of URL with IP address and port."""
    assert is_valid_url("http://192.168.1.1:8080") is True


def test_valid_url_complex_path():
    """Test validation of a URL with complex path."""
    assert is_valid_url("https://example.com/path/to/resource.html") is True


def test_invalid_url_no_protocol():
    """Test rejection of URL without protocol."""
    assert is_valid_url("example.com") is False


def test_invalid_url_wrong_protocol():
    """Test rejection of URL with wrong protocol."""
    assert is_valid_url("ftp://example.com") is False


def test_invalid_url_no_domain():
    """Test rejection of URL without domain."""
    assert is_valid_url("https://") is False


def test_invalid_url_empty_string():
    """Test rejection of empty string."""
    assert is_valid_url("") is False


def test_invalid_url_spaces():
    """Test rejection of URL with spaces."""
    assert is_valid_url("https://example.com/path with spaces") is False


def test_invalid_url_non_string():
    """Test rejection of non-string input."""
    assert is_valid_url(123) is False


def test_invalid_url_none():
    """Test rejection of None input."""
    assert is_valid_url(None) is False


def test_invalid_url_invalid_characters():
    """Test rejection of URL with invalid characters."""
    assert is_valid_url("https://exam@ple.com") is False


def test_invalid_url_domain_starts_with_hyphen():
    """Test rejection of domain starting with hyphen."""
    assert is_valid_url("https://-example.com") is False


def test_invalid_url_domain_ends_with_hyphen():
    """Test rejection of domain ending with hyphen."""
    assert is_valid_url("https://example-.com") is False


def test_invalid_url_subdomain_starts_with_hyphen():
    """Test rejection of subdomain starting with hyphen."""
    assert is_valid_url("https://-api.example.com") is False


def test_invalid_url_only_protocol():
    """Test rejection of URL with only protocol."""
    assert is_valid_url("https://") is False


def test_invalid_url_protocol_no_slash():
    """Test rejection of malformed protocol."""
    assert is_valid_url("httpexample.com") is False
