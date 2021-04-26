#!/usr/bin/env bash 
set -xe

# install packages and dependencies
go get github.com/ialopez/emojiart

# build command
go build -o bin/application application.go
