package main

import "testing"

func TestGcd(t *testing.T) {
	// Test case: gcd(12, 8) == 4
	expected := 4
	actual := gcd(12, 8)
	if actual != expected {
		t.Errorf("gcd(12, 8) = %d; expected %d", actual, expected)
	}

	// Test case: gcd(17, 5) == 1
	expected = 1
	actual = gcd(17, 5)
	if actual != expected {
		t.Errorf("gcd(17, 5) = %d; expected %d", actual, expected)
	}

	// Test case: gcd(0, 5) == 5
	expected = 5
	actual = gcd(0, 5)
	if actual != expected {
		t.Errorf("gcd(0, 5) = %d; expected %d", actual, expected)
	}

	// Test case: gcd(5, 0) == 5
	expected = 5
	actual = gcd(5, 0)
	if actual != expected {
		t.Errorf("gcd(5, 0) = %d; expected %d", actual, expected)
	}

	// Test case: gcd(-12, 8) == 4 (negative input handling)
	expected = 4
	actual = gcd(-12, 8)
	if actual != expected {
		t.Errorf("gcd(-12, 8) = %d; expected %d", actual, expected)
	}

	// Test case: gcd(0, 0) == 0
	expected = 0
	actual = gcd(0, 0)
	if actual != expected {
		t.Errorf("gcd(0, 0) = %d; expected %d", actual, expected)
	}

	// Additional test: both negative inputs
	expected = 6
	actual = gcd(-18, -12)
	if actual != expected {
		t.Errorf("gcd(-18, -12) = %d; expected %d", actual, expected)
	}

	// Additional test: same values
	expected = 7
	actual = gcd(7, 7)
	if actual != expected {
		t.Errorf("gcd(7, 7) = %d; expected %d", actual, expected)
	}
}
