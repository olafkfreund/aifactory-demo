# AC#1: A function gcd(a: int, b: int) -> int returning the greatest common
# divisor using the Euclidean algorithm.
#
# This module verifies the signature/return contract: gcd(a, b) returns an
# `int` that is the greatest common divisor for typical positive inputs.
"""Signature/return-type tests for app.utils.gcd."""

import pytest

from app.utils import gcd


@pytest.mark.parametrize(
    "a,b,expected",
    [
        (12, 8, 4),
        (17, 5, 1),
        (48, 36, 12),
        (7, 7, 7),
        (100, 10, 10),
    ],
    ids=[
        "common-factor-4",
        "coprime-1",
        "common-factor-12",
        "equal-values",
        "divisor-relationship",
    ],
)
def test_gcd_positive_inputs_returns_expected_divisor(a, b, expected):
    """gcd returns the greatest common divisor for typical positive inputs."""
    assert gcd(a, b) == expected


@pytest.mark.parametrize(
    "a,b",
    [(12, 8), (17, 5), (48, 36)],
    ids=["common-factor", "coprime", "large-common-factor"],
)
def test_gcd_positive_inputs_returns_int_type(a, b):
    """gcd returns a value whose type is exactly int for positive inputs."""
    result = gcd(a, b)
    assert type(result) is int
