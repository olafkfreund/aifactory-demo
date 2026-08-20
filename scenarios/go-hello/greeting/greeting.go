// Package greeting provides a small, reusable greeting function.
package greeting

import "strings"

// Greet returns a friendly greeting for the given name.
//
// Surrounding whitespace is trimmed from name. If the trimmed name is empty,
// a friendly default ("Hello, stranger!") is returned instead.
func Greet(name string) string {
	trimmed := strings.TrimSpace(name)
	if trimmed == "" {
		return "Hello, stranger!"
	}
	return "Hello, " + trimmed + "!"
}
