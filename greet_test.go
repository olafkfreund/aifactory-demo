package main

import "testing"

func TestGreet(t *testing.T) {
	// Test with normal names
	testCases := []struct {
		name     string
		expected string
	}{
		{"World", "Hello, World!"},
		{"Go", "Hello, Go!"},
		{"Bob", "Hello, Bob!"},
	}

	for _, tc := range testCases {
		actual := greet(tc.name)
		if actual != tc.expected {
			t.Errorf("greet(%q) = %q; expected %q", tc.name, actual, tc.expected)
		}
	}
}

func TestGreetEmpty(t *testing.T) {
	// Test with empty string - should return "Hello, World!"
	result := greet("")
	expected := "Hello, World!"
	if result != expected {
		t.Errorf("greet(\"\") = %q; expected %q", result, expected)
	}
}

func TestGreetWhitespace(t *testing.T) {
	// Test with whitespace-only string - should return "Hello, World!"
	result := greet("   ")
	expected := "Hello, World!"
	if result != expected {
		t.Errorf("greet(\"   \") = %q; expected %q", result, expected)
	}
}