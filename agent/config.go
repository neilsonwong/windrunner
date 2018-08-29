package main

import (
	"log"
	"os"
	"encoding/json"
)

type Config struct {
	Sharename string `json:"SHARE_PATH"`
	ListingServer string `json:"LISTING_SERVER"`
}

func LoadConfig() Config {
	config := Config{}

	configFile, err := os.Open("config.json")
	if err != nil {
		log.Printf("opening config file", err.Error())
	}

	jsonParser := json.NewDecoder(configFile)
	if err = jsonParser.Decode(&config); err != nil {
		log.Printf("parsing config file", err.Error())
	}
	return config
}