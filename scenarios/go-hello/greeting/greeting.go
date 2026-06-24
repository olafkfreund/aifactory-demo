package greeting

import "strings"

// Greet returns a greeting for the given name.
func Greet(name string) string {
	return "Hello, " + strings.TrimSpace(name)
}
