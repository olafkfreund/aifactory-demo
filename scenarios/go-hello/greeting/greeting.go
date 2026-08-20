// Package greeting provides a small, reusable greeting helper.
package greeting

import "strings"

// Greet returns a friendly greeting for the given name.
//
// Surrounding whitespace is trimmed from name. If the trimmed name is empty,
// a friendly default addressed to "stranger" is returned.
func Greet(name string) string {
	trimmed := strings.TrimSpace(name)
	if trimmed == "" {
		return "Hello, stranger!"
	}
	return "Hello, " + trimmed + "!"
}
