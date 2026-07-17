from src.app.helpers.square import square


def test_square_5_returns_25():
    result = square(5)
    assert result == 25


def test_square_0_returns_0():
    result = square(0)
    assert result == 0


def test_square_negative_3_returns_9():
    result = square(-3)
    assert result == 9
