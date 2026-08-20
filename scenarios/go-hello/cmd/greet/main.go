// Command greet prints a friendly greeting for the name given as the first
// CLI argument, or a default greeting when no argument is provided.
package main

import (
	"fmt"
	"os"

	"go-hello/greeting"
)

func main() {
	name := ""
	if len(os.Args) > 1 {
		name = os.Args[1]
	}
	fmt.Println(greeting.Greet(name))
}
