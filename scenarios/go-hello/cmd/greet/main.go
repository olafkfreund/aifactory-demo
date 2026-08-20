// Command greet prints a greeting for the name given as the first CLI argument.
package main

import (
	"fmt"
	"os"

	"github.com/aifactory-demo/scenarios/go-hello/greeting"
)

func main() {
	var name string
	if len(os.Args) > 1 {
		name = os.Args[1]
	}
	fmt.Println(greeting.Greet(name))
}
