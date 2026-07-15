package main

import "testing"

func TestGreet(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "normal name",
			input:    "Bob",
			expected: "Hello, Bob!",
		},
		{
			name:     "another normal name",
			input:    "World",
			expected: "Hello, World!",
		},
		{
			name:     "another normal name - Go",
			input:    "Go",
			expected: "Hello, Go!",
		},
		{
			name:     "empty string",
			input:    "",
			expected: "Hello, World!",
		},
		{
			name:     "whitespace only",
			input:    "   ",
			expected: "Hello, World!",
		},
		{
			name:     "whitespace with mixed content",
			input:    "  \t  ",
			expected: "Hello, World!",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			actual := greet(tt.input)
			if actual != tt.expected {
				t.Errorf("greet(%q) = %q; expected %q", tt.input, actual, tt.expected)
			}
		})
	}
}