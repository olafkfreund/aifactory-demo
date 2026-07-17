from helpers.thousands import thousands


def test_thousands_basic():
    assert thousands(42) == "42"


def test_thousands_one_thousand():
    assert thousands(1000) == "1,000"


def test_thousands_millions():
    assert thousands(1234567) == "1,234,567"


def test_thousands_zero():
    assert thousands(0) == "0"


def test_thousands_negative():
    assert thousands(-1000) == "-1,000"


def test_thousands_float():
    assert thousands(1000.5) == "1,000"


def test_thousands_large_number():
    assert thousands(123456789) == "123,456,789"
