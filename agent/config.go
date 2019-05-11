package main

import (
	"log"
	"os"
	"encoding/json"
)

type Config struct {
	Version string `json:"VERSION"`
	ShareServer string `json:"SHARE_SERVER"`
	ShareFolder string `json:"SHARE_FOLDER"`
	ListingServer string `json:"LISTING_SERVER"`
	OsxMountPoint string `json:"OSX_MOUNT"`
	ServerPort int `json:"SERVER_PORT"`
}

func LoadConfig() Config {
	config := Config{}

	configFile, err := os.Open("./config.json")
	if err != nil {
		log.Printf("opening config file", err.Error())
	}

	jsonParser := json.NewDecoder(configFile)
	if err = jsonParser.Decode(&config); err != nil {
		log.Printf("parsing config file", err.Error())
	}
	return config
}