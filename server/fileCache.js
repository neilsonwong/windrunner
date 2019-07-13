'use strict';

const fs = require('fs');
const path = require('path');
const cacheFolder = require('./config').CACHE_FOLDER;

class FileCache {
  constructor() {
    //setup defaults
    this.cacheFolder = cacheFolder;
    this.cache = {};
  }

  async loadCache(cacheName) {
    //load cache from file
    try {
      let cacheData = await this.loadCacheFromFile(cacheName);
      this.cache[cacheName] = JSON.parse(cacheData);
      console.log(`cache ${cacheName} is loaded`);
    }
    catch (e) {
      console.log(`Error retrieving cache ${cacheName}`);
      console.log(e);
    }
  }

  get(cacheName) {
    if (this.cache[cacheName] === undefined) {
      throw `${cacheName} has not been loaded`;
    }
    return this.cache[cacheName];
  }

  async set(cacheName, val) {
    this.cache[cacheName] = val;
    await this.writeCacheToFile(cacheName);
  }

  loadCacheFromFile(cacheName) {
    let cacheFile = path.join(this.cacheFolder, cacheName + '.json');
    return new Promise((res, rej) => {
      fs.readFile(cacheFile, (err, data) => {
        if (err) {
          rej(err);
        }
        res(data);
      });
    });
  }

  writeCacheToFile(cacheName){
    let cacheFile = path.join(this.cacheFolder, cacheName + '.json');
    return new Promise((res, rej) => {
      fs.writeFile(cacheFile, JSON.stringify(this.cache[cacheName]), 'utf8', (err) => {
        if (err) {
          rej(err);
        }
        else {
          res();
        }
      });
    });
  }

}

module.exports = new FileCache();

