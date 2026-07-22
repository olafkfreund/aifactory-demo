package main

import "fmt"

func greet(name string) string {
	return "Hello, " + name + "!"
}

func gcd(a, b int) int {
	// Convert to absolute values to handle negative inputs
	if a < 0 {
		a = -a
	}
	if b < 0 {
		b = -b
	}

	// Euclidean algorithm
	for b != 0 {
		a, b = b, a%b
	}
	return a
}

func main() {
	fmt.Println("Hello World")
	greeting := greet("World")
	fmt.Println(greeting)
}