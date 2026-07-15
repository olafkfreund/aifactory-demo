package main

import "testing"

func TestGreet(t *testing.T) {
	expected := "Hello, World!"
	actual := greet("World")
	if actual != expected {
		t.Errorf("greet(\"World\") = %s; expected %s", actual, expected)
	}
	
	// Test with another name
	expected = "Hello, Go!"
	actual = greet("Go")
	if actual != expected {
		t.Errorf("greet(\"Go\") = %s; expected %s", actual, expected)
	}

	// Test with empty string
	expected = "Hello, World!"
	actual = greet("")
	if actual != expected {
		t.Errorf("greet(\"\") = %s; expected %s", actual, expected)
	}

	// Test with whitespace-only string
	expected = "Hello, World!"
	actual = greet("   ")
	if actual != expected {
		t.Errorf("greet(\"   \") = %s; expected %s", actual, expected)
	}
}