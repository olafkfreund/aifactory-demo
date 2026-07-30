"""Unit tests for the pure-stdlib ordinal helper.

Covers the standard ``st``/``nd``/``rd``/``th`` suffixes, the 11/12/13
"teen" exception (including numbers that merely end in those digits, e.g.
111), the general mod-10 rule, and negative-input validation.
"""

import pytest

from app.ordinal import ordinal


# ordinal: standard suffixes -------------------------------------------
def test_ordinal_standard_suffixes():
    assert ordinal(1) == "1st"
    assert ordinal(2) == "2nd"
    assert ordinal(3) == "3rd"
    assert ordinal(4) == "4th"


# ordinal: teen exception ----------------------------------------------
def test_ordinal_teens_are_th():
    assert ordinal(11) == "11th"
    assert ordinal(12) == "12th"
    assert ordinal(13) == "13th"


# ordinal: general rule ------------------------------------------------
def test_ordinal_general_rule_uses_last_digit():
    assert ordinal(21) == "21st"
    assert ordinal(101) == "101st"
    # 111 ends in "11" so the mod-100 exception generalizes beyond 11-13.
    assert ordinal(111) == "111th"


# ordinal: validation --------------------------------------------------
def test_ordinal_negative_raises_valueerror():
    with pytest.raises(ValueError):
        ordinal(-1)
