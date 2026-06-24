package greeting

import (
	"testing"
)

func TestGreet(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "World",
			input:    "World",
			expected: "Hello, World",
		},
		{
			name:     "empty",
			input:    "",
			expected: "Hello, ",
		},
		{
			name:     "whitespace trimming",
			input:    "  World  ",
			expected: "Hello, World",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := Greet(tt.input)
			if got != tt.expected {
				t.Errorf("Greet(%q) = %q; want %q", tt.input, got, tt.expected)
			}
		})
	}
}
