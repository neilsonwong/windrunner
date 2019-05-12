package main

import (
	"fmt"
	"log"
	"net/http"
	"io/ioutil"
	"encoding/json"
	"time"
	"io"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"os/exec"
)

const GOOS string = runtime.GOOS
const GOARCH string = runtime.GOARCH

type Asset struct {
	ID                 int       `json:"id"`
	URL                string    `json:"url"`
	Name               string    `json:"name"`
	Size               int       `json:"size"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
	BrowserDownloadURL string    `json:"browser_download_url"`
}

type Release struct {
	ID          int       `json:"id"`
	URL         string    `json:"url"`
	AssetURL    string    `json:"asset_url"`
	UploadURL   string    `json:"upload_url"`
	HTMLURL     string    `json:"html_url"`
	TagName     string    `json:"tag_name"`
	Name        string    `json:"name"`
	CreatedAt   time.Time `json:"created_at"`
	PublishedAt time.Time `json:"published_at"`
	Prerelease  bool      `json:"prerelease"`
	Assets      []Asset   `json:"assets"`
}

func CheckForUpdate(currentVersion string) bool {
	desiredBuild := GOOS + "-" + GOARCH
	log.Println(fmt.Sprintf("Running on %s", desiredBuild))

	//grab the latest releases
	resp, err := http.Get("https://api.github.com/repos/neilsonwong/windrunner/releases/latest")
	if err != nil {
		log.Println("there was an error retrieving the latest releases")
		return false
	}

	defer resp.Body.Close()
	//read the whole stream
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Println("there was an error reading the body for the latest releases request")	
		return false
	}

	releaseInfo := &Release{}
	err = json.Unmarshal(body, releaseInfo)
	if err != nil {
		log.Println("there was an error parsing the body for the latest releases request")
		return false
	}

	if releaseInfo.TagName != currentVersion {
		log.Println(fmt.Sprintf("the current version is %s", currentVersion))
		log.Println(fmt.Sprintf("the latest version is %s", releaseInfo.TagName))

		for _, asset := range releaseInfo.Assets {
			// fmt.Println(asset.Name)
			if (strings.Contains(asset.Name, GOOS) && strings.Contains(asset.Name, GOARCH)) {
				log.Println(fmt.Sprintf("downloading %s", asset.BrowserDownloadURL))
				err = downloadUpdate(asset.BrowserDownloadURL)
				if err != nil {
					fmt.Println(err)
					return false
				}
				startUpdater()
				return true
			}
		}
	} else {
		log.Println("the current version is up to date")
		return false
	}
	log.Println("No matching releases, did you mess with the configs?")
	return false
}

func downloadUpdate(updateUrl string) error {
	updateFolder := "./updates"
	if _, err := os.Stat(updateFolder); os.IsNotExist(err) {
		os.Mkdir(updateFolder, 0755)
	}
	filename := filepath.Base(updateUrl)
	outputPath := fmt.Sprintf("%s/%s", updateFolder, filename);


	resp, err := http.Get(updateUrl)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	out, err := os.Create(outputPath)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, resp.Body)
	return err
}

func startUpdater() {
	dir, err := filepath.Abs(filepath.Dir(os.Args[0]))
    if err != nil {
        log.Println(err)
        return
    }

	updateScript := dir + "/update_" + GOOS + ".sh"

	if GOOS == "windows" {
		updateScript = "update_" + GOOS + ".bat"

		log.Println("executing " + updateScript)
		cmd := exec.Command("cmd.exe", "/C", updateScript)
		cmd.Start()
	} else {
		log.Println("executing " + updateScript)
		cmd := exec.Command("/bin/bash", updateScript)
		cmd.Start()
	}
}