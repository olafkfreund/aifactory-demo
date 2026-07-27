package main

import "testing"

func TestShout(t *testing.T) {
	expected := "BOB!"
	actual := shout("bob")
	if actual != expected {
		t.Errorf("shout(\"bob\") = %s; expected %s", actual, expected)
	}
}
