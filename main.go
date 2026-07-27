package main

import (
	"fmt"
	"strings"
)

func greet(name string) string {
	return "Hello, " + name + "!"
}

func shout(name string) string {
	return strings.ToUpper(name) + "!"
}

func main() {
	fmt.Println("Hello World")
	greeting := greet("World")
	fmt.Println(greeting)
}