'use strict';
const { sleep } = require('./index');

// super simple cache implementation
class Cache {
  constructor() { 
    this.cache = {};
  }

  async set(key, value, ttl) {
    this.cache[key] = value;
    if (ttl) {
      // just sit and wait the ttl then delete the key
      await sleep(ttl);
      delete this.cache[key];
      console.log('deleting from cache')
    }
  }

  get(key) {
    return this.cache[key];
  }
}

module.exports = Cache;