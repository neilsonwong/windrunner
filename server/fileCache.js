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
      let cacheData = await loadCacheFromFile(cacheName);
      this.cache[cacheName] = JSON.parse(cacheData);
      console.log(`cache ${cacheName} is loaded`);
    }
    catch (e) {
      console.log('Error retrieving cache ${cacheName}');
    }
  }

  async get(cacheName) {
    if (this.cache[cacheName] === undefined) {
      await loadCache(cacheName);
    }
    return this.cache[cacheName];
  }

  async set(cacheName, val) {
    this.cache[cacheName] = val;
    await writeCacheToFile(cacheName);
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
