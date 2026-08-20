package greeting

import "testing"

func TestGreet(t *testing.T) {
	tests := []struct {
		name  string
		input string
		want  string
	}{
		{name: "AC#1 simple name", input: "World", want: "Hello, World!"},
		{name: "AC#2 empty name", input: "", want: "Hello, stranger!"},
		{name: "AC#3 surrounding whitespace trimmed", input: "  Bob ", want: "Hello, Bob!"},
		{name: "AC#3 whitespace-only name", input: "   ", want: "Hello, stranger!"},
		{name: "AC#3 tabs and newlines trimmed", input: "\t\nAlice\n", want: "Hello, Alice!"},
		{name: "AC#3 internal whitespace preserved", input: "  Ada Lovelace  ", want: "Hello, Ada Lovelace!"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := Greet(tt.input); got != tt.want {
				t.Errorf("Greet(%q) = %q, want %q", tt.input, got, tt.want)
			}
		})
	}
}
