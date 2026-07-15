package main

import "testing"

func TestGreet(t *testing.T) {
	expected := "Hello, World!"
	actual := greet("World")
	if actual != expected {
		t.Errorf("greet(\"World\") = %s; expected %s", actual, expected)
	}
	
	// Test with another name
	expected = "Hello, Bob!"
	actual = greet("Bob")
	if actual != expected {
		t.Errorf("greet(\"Bob\") = %s; expected %s", actual, expected)
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