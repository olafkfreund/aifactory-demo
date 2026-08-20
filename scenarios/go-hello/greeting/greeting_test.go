package greeting

import "testing"

func TestGreet(t *testing.T) {
	tests := []struct {
		name  string
		input string
		want  string
	}{
		{name: "AC#1 plain name", input: "World", want: "Hello, World!"},
		{name: "AC#2 empty name", input: "", want: "Hello, stranger!"},
		{name: "AC#3 surrounding whitespace trimmed", input: "  Bob ", want: "Hello, Bob!"},
		{name: "whitespace-only name", input: "   ", want: "Hello, stranger!"},
		{name: "internal whitespace preserved", input: " Bob Smith ", want: "Hello, Bob Smith!"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := Greet(tt.input); got != tt.want {
				t.Errorf("Greet(%q) = %q; want %q", tt.input, got, tt.want)
			}
		})
	}
}
