package main

import (
	"fmt"
	"strings"
)

func greet(name string) string {
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