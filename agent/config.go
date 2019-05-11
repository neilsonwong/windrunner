package main

import (
	"log"
	"os"
	"encoding/json"
	"io/ioutil"
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
	log.Printf("loading configs")
	config := Config{}

	configFile, err := os.Open("./config.json")
	if err != nil {
		log.Printf("opening config file", err.Error())
	}

	jsonParser := json.NewDecoder(configFile)
	if err = jsonParser.Decode(&config); err != nil {
		log.Printf("parsing config file", err.Error())
	}

	//check if we need to merge configs
	config = mergeConfigs(config)

	return config
}

func mergeConfigs(config Config) Config {
	oldConfig := Config{}

	configFile, err := os.Open("./config.json.old")
	if err != nil {
		log.Printf("opening old config file", err.Error())

		// can't open old config, usually means there is no old config to merge
		return config
	}

	log.Printf("merging configs")

	jsonParser := json.NewDecoder(configFile)
	if err = jsonParser.Decode(&oldConfig); err != nil {
		log.Printf("parsing old config file", err.Error())
	}

	// any old properties will overwrite the current one
	// i am lazy, manually do this lol
	config.ShareServer = oldConfig.ShareServer
	config.ShareFolder = oldConfig.ShareFolder
	config.ListingServer = oldConfig.ListingServer
	config.OsxMountPoint = oldConfig.OsxMountPoint
	config.ServerPort = oldConfig.ServerPort

	// update json file
	updated := writeNewConfig(config)

	// update json file
	if updated == true {
		os.Remove("./config.json.old")
	}

	return config
}

func writeNewConfig(config Config) bool {
	file, _ := json.MarshalIndent(config, "", "    ")
	err := ioutil.WriteFile("config.json", file, 0755)

	if err != nil {
		log.Printf("error writing config file", err.Error())
		return false
	}
	return true
}