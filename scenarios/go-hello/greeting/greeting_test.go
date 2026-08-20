package greeting

import "testing"

func TestGreet(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{name: "basic name", input: "World", expected: "Hello, World!"},
		{name: "empty name", input: "", expected: "Hello, stranger!"},
		{name: "whitespace-trimmed name", input: "  Bob ", expected: "Hello, Bob!"},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			actual := Greet(tc.input)
			if actual != tc.expected {
				t.Errorf("Greet(%q) = %q; expected %q", tc.input, actual, tc.expected)
			}
		})
	}
}
