package main

import (
	"fmt"
	"strings"
)

func greet(name string) string {
	// Use "World" as default if name is empty or only whitespace
	trimmedName := strings.TrimSpace(name)
	if trimmedName == "" {
		return "Hello, World!"
	}
	return "Hello, " + trimmedName + "!"
}

func main() {
	fmt.Println("Hello World")
	greeting := greet("World")
	fmt.Println(greeting)
}