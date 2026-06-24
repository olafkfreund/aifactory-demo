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
