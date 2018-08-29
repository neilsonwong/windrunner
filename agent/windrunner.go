package main

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"io/ioutil"
)

const sharename = "//RASPBERRYPI/share"

func Windunner() {
	//ensure mount is successful
	MountSmb(sharename)

	h := http.NewServeMux()

	//setup the play function
	h.HandleFunc("/play", func(resw http.ResponseWriter, req *http.Request) {
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

	h.HandleFunc("/hello", func(resw http.ResponseWriter, req *http.Request) {
		fmt.Fprintf(resw, "Hello, this is a gopher reporting in")
	})

	hl := proxy(h)

	err := http.ListenAndServe(":8080", hl)
	log.Fatal(err)
}

func handlePlay(resw http.ResponseWriter, req *http.Request) {
	//Open(`//RASPBERRYPI/share/anime/Air/[Doki] Air - 01v2 (1280x720 h264 BD FLAC) [E13ADA79].mkv`)
	file := req.FormValue("file")

	fmt.Println(file)

	//perhaps cut the share out of filename in future? not sure
	Open(sharename, file)
	fmt.Fprintf(resw, "opened " + file)
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
}

func proxy(h http.Handler) http.Handler {
	return http.HandlerFunc(func(resw http.ResponseWriter, r *http.Request) {
		//r.URL is what i want to proxy to the local server
		urlString := r.URL.String()
		if strings.HasPrefix(urlString, "/ls") || strings.HasPrefix(urlString, "/thumb") || strings.HasPrefix(urlString, "/find") {
			enableCors(&resw)
			//handle the proxy request
			resp, err := proxyRequest(urlString)
			if err == nil {
				resw.Write(resp)
			} else {
				fmt.Fprintf(resw, "problem proxying to http://192.168.0.159:8000")
			}
			return
		}
		log.Printf("%s requested %s", r.RemoteAddr, r.URL)
		h.ServeHTTP(resw, r)
	})
}

//it was so close, but https still does not like the sneaky server redirect
func redir(w http.ResponseWriter, req *http.Request) {
	fmt.Println("redirecting to " + "http://192.168.0.159:8000"+req.RequestURI)
	http.Redirect(w, req, "http://192.168.0.159:8000"+req.RequestURI, http.StatusMovedPermanently)
}

func proxyRequest(url string) ([]byte, error) {
	fmt.Println("proxying to http://192.168.0.159:8000" + url)
	resp, err := http.Get("http://127.0.0.1:8000" + url)
	if err != nil {
		// handle error
	}

	defer resp.Body.Close()
	return ioutil.ReadAll(resp.Body)

}