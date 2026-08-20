// Command greet prints a friendly greeting for the first CLI argument.
package main

import (
	"fmt"
	"os"

	"go-hello/greeting"
)

func main() {
	var name string
	if len(os.Args) > 1 {
		name = os.Args[1]
	}
	fmt.Println(greeting.Greet(name))
}
