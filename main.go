package main

import "fmt"

func greet(name string) string {
	return "Hello, " + name + "!"
}

func main() {
	fmt.Println("Hello World")
	greeting := greet("World")
	fmt.Println(greeting)
}