package main

import (
	"fmt"
	"log"
	"bytes"
	"net/http"
	"strings"
	"strconv"
	"io/ioutil"
)

var config Config = LoadConfig()

func Windunner() {
	port := strconv.Itoa(config.ServerPort)

	sharename := "//" + config.ShareServer + "/" + config.ShareFolder
	log.Println("config: share located at " + sharename)
	log.Println("config: listing server at " + config.ListingServer)
	log.Println("config: osx mount point at " + config.OsxMountPoint)
	log.Println("config: agent hosted on port " + port)


	//ensure mount is successful
	MountSmb(config.ShareServer, config.ShareFolder, false)

	//setup http server
	h := http.NewServeMux()

	//setup the play function
	h.HandleFunc("/play", func(resw http.ResponseWriter, req *http.Request) {
		enableCors(&resw)

		switch req.Method {
			case "POST":
				handlePlay(resw, req, config.ShareServer, config.ShareFolder)
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

	//setup proxy to fire to listing server
	hl := proxy(h, config.ListingServer)

	err := http.ListenAndServe(":" + port, hl)
	log.Fatal(err)
}

func handlePlay(resw http.ResponseWriter, req *http.Request, shareServer string, shareFolder string) {
	//Open(`//RASPBERRYPI/share/anime/Air/[Doki] Air - 01v2 (1280x720 h264 BD FLAC) [E13ADA79].mkv`)
	file := req.FormValue("file")

	log.Println(file)

	//ensure that share is mounted
	err := MountSmb(shareServer, shareFolder, true)
	sharename := "//" + config.ShareServer + "/" + config.ShareFolder

	if err != nil {
		fmt.Fprintf(resw, "unable to mount " + sharename)
	} else {
		//perhaps cut the share out of filename in future? not sure
		Open(shareServer, shareFolder, file)
		fmt.Fprintf(resw, "opened " + file)
	}
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}

func proxy(h http.Handler, listingServer string) http.Handler {
	return http.HandlerFunc(func(resw http.ResponseWriter, r *http.Request) {
		//r.URL is what i want to proxy to the local server
		urlString := r.URL.String()
		if strings.HasPrefix(urlString, "/ls") || strings.HasPrefix(urlString, "/thumb") || strings.HasPrefix(urlString, "/find") {
			enableCors(&resw)
			//handle the proxy request
			fullUrl := listingServer + urlString
			resp, err := proxyRequest(fullUrl)
			if err == nil {
				resw.Write(resp)
			} else {
				fmt.Fprintf(resw, "problem proxying to " + listingServer)
			}
			return
		} else if (strings.HasPrefix(urlString, "/pins")) {
			enableCors(&resw)
			//handle the proxy request
			fullUrl := listingServer + urlString
			resp, err := proxyPost(fullUrl, r)
			if err == nil {
				resw.Write(resp)
			} else {
				fmt.Fprintf(resw, "problem proxying to " + listingServer)
			}
			return
		}
		log.Printf("%s requested %s", r.RemoteAddr, r.URL)
		h.ServeHTTP(resw, r)
	})
}

//it was so close, but https still does not like the sneaky server redirect
// func redir(w http.ResponseWriter, req *http.Request) {
// 	log.Println("redirecting to " + "http://192.168.0.159:8000" + req.RequestURI)
// 	http.Redirect(w, req, "http://192.168.0.159:8000" + req.RequestURI, http.StatusMovedPermanently)
// }

func proxyRequest(url string) ([]byte, error) {
	log.Println("proxying to " + url)
	resp, err := http.Get(url)
	if err != nil {
		// handle error
		log.Printf("%s", err)
		return []byte{}, err
	}

	defer resp.Body.Close()
	return ioutil.ReadAll(resp.Body)
}

func proxyPost(url string, r *http.Request) ([]byte, error) {
	reqBody := r.Body
	reqBodyBytes, _ := ioutil.ReadAll(reqBody)
	contentType := http.DetectContentType(reqBodyBytes)

	log.Println("proxying post to " + url)
	log.Println(contentType)
	log.Println(string(reqBodyBytes[:]))
	resp, err := http.Post(url, contentType, bytes.NewReader(reqBodyBytes))
	if err != nil {
		// handle error
		log.Printf("%s", err)
		return []byte{}, err
	}

	defer resp.Body.Close()
	return ioutil.ReadAll(resp.Body)
}
