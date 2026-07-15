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
		{"", "Hello, World!"},           // empty string
		{"   ", "Hello, World!"},         // whitespace only
		{"\t\n", "Hello, World!"},        // tabs and newlines
	}

	for _, tc := range testCases {
		actual := greet(tc.name)
		if actual != tc.expected {
			t.Errorf("greet(%q) = %q; expected %q", tc.name, actual, tc.expected)
		}
	}
}