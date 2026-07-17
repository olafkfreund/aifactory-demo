package main

import "fmt"

func greet(name string) string {
	return "Hello, " + name + "!"
}

func main() {
	fmt.Println("Hello World")
	greeting := greet("World")
	fmt.Println(greeting)

	// Example usage of Clamp function
	fmt.Println("\n--- Clamp Function Examples ---")
	exampleClamp(5.0, 0.0, 10.0)
	exampleClamp(-5.0, 0.0, 10.0)
	exampleClamp(15.0, 0.0, 10.0)
	exampleClamp(3.14159, 0.0, 5.0)
}

func exampleClamp(value, low, high float64) {
	result := Clamp(value, low, high)
	fmt.Printf("Clamp(%.2f, %.2f, %.2f) = %.5f\n", value, low, high, result)
}