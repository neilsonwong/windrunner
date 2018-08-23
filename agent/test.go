package main

import (
	"fmt"
	"os/exec"
)

func main() {
    fmt.Println("hello this is test")
    cmd := exec.Command("vlc")
    err := cmd.Start();
    if  err != nil {
	fmt.Printf("error")
    }
    fmt.Println("waiting")
    err = cmd.Wait()
    fmt.Println("we done")
}
