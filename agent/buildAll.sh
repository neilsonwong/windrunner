#!/bin/bash
# build the binaries

# clear bin dir
rm -rf bin
mkdir -p bin/linux
mkdir -p bin/darwin
mkdir -p bin/windows

# build for all platforms
# for windows, build with -ldflags -H=windowsgui to hide console windows when running

echo "building x86: linux, darwin, windows"
env GOOS=linux GOARCH=386 go build -o bin/linux/agent
env GOOS=darwin GOARCH=386 go build -o bin/darwin/agent
env GOOS=windows GOARCH=386 go build -ldflags -H=windowsgui -o bin/windows/agent.exe

echo "building x64: linux, darwin, windows"
env GOOS=linux GOARCH=amd64 go build -o bin/linux/agent64
env GOOS=darwin GOARCH=amd64 go build -o bin/darwin/agent64
env GOOS=windows GOARCH=amd64 go build -ldflags -H=windowsgui -o bin/windows/agent64.exe