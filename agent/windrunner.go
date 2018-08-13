package main

import (
	"fmt"
	"net/http"
	"log"
)

const sharename = "//RASPBERRYPI/share"

func main() {
	//ensure mount is successful
	MountSmb(sharename)

	//setup the play function
	http.HandleFunc("/play", func(resw http.ResponseWriter, req *http.Request) {
		enableCors(&resw)

		switch req.Method {
			case "POST":
				handlePlay(resw, req)
			case "GET":
			case "PUT":
			case "DELETE":
			default:
				fmt.Fprintf(resw, "could not find the resource")

		}
	});

	http.HandleFunc("/hello", func(resw http.ResponseWriter, req *http.Request) {
		fmt.Fprintf(resw, "Hello, this is a gopher reporting in")
	})

	log.Fatal(http.ListenAndServe(":8080", nil))
}

func handlePlay(resw http.ResponseWriter, req *http.Request) {
	//Open(`//RASPBERRYPI/share/anime/Air/[Doki] Air - 01v2 (1280x720 h264 BD FLAC) [E13ADA79].mkv`)
	file := req.FormValue("file")

	fmt.Println(file)

	//perhaps cut the share out of filename in future? not sure
	Open(sharename, file)
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
}