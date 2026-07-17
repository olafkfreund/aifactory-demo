from src.app.helpers.greeting import hello


def test_hello_with_world():
    assert hello("World") == "Hello, World!"


def test_hello_with_name():
    assert hello("Alice") == "Hello, Alice!"


def test_hello_with_empty_string():
    assert hello("") == "Hello, !"
