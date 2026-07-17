from src.app.helpers.cube import cube


def test_cube_of_three():
    assert cube(3) == 27


def test_cube_of_zero():
    assert cube(0) == 0


def test_cube_of_negative():
    assert cube(-2) == -8


def test_cube_of_one():
    assert cube(1) == 1
