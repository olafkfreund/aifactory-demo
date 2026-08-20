// Package greeting provides a small, reusable greeting helper.
package greeting

import (
	"fmt"
	"strings"
)

// Greet returns a friendly greeting for the given name.
//
// Surrounding whitespace is trimmed from name. If the trimmed name is empty,
// a friendly default of "stranger" is used instead.
func Greet(name string) string {
	name = strings.TrimSpace(name)
	if name == "" {
		name = "stranger"
	}
	return fmt.Sprintf("Hello, %s!", name)
}
