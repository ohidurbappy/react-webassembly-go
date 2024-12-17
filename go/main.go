//go:build wasm
// +build wasm

package main

import (
	"crypto/sha256"
	"encoding/hex"
	"syscall/js"
)

func main() {

	done := make(chan struct{}, 0)

	js.Global().Set("square", js.FuncOf(square))
	js.Global().Set("generateSHA256", js.FuncOf(generateSHA256))

	<-done
}

func square(this js.Value, p []js.Value) interface{} {

	return p[0].Int() * p[0].Int()

}

// function to generate sha256 hash
func generateSHA256(this js.Value, p []js.Value) interface{} {
	// get the input value
	input := p[0].String()

	// create a new hash
	hash := sha256.New()

	// write the input value to the hash
	hash.Write([]byte(input))

	// return the hash value
	return hex.EncodeToString(hash.Sum(nil))
}
