'use strict';

const level = require('level');
const winston = require('../winston');

const db = level('windrunner-db', { valueEncoding: 'json'});

class LevelDbInterface {
  constructor(prefix) {
    this.prefix = prefix ? prefix : '';
  }

  async get(rawKey) {
    const key = `${this.prefix}/${rawKey}`;
    try {
      const data = await db.get(key);
      winston.silly(`leveldb data for ${key} is ${data}`);
      return data;
    }
    catch (e) {
      if (e.type !== 'NotFoundError') {
        winston.silly(`no entry for ${key} in leveldb`);
      }
      return undefined;
    }
  }

  async all() {
    const getAllPromise = new Promise((res, rej) => {
      const streamVals = {};
      db.createReadStream({
        gte: this.prefix,
        lte: String.fromCharCode(this.prefix.charCodeAt(0) + 1)
      })
        .on('data', function (data) {
          streamVals[data.key] = data.value;
        })
        .on('error', function (err) {
          winston.warn('get all stream encountered an error');
          rej(err);
        })
        .on('close', () => {
          winston.silly('get all stream closed');
        })
        .on('end', () => {
          winston.silly('get all stream ended');
          res(streamVals);
        });
    });
    return await getAllPromise;
  }

  async put(rawKey, data) {
    const key = `${this.prefix}/${rawKey}`;
    try {
      await db.put(key, data);
      winston.silly(`put ${key} as ${data}`);
      return true;
    }
    catch (e) {
      winston.error(`there was an error when putting data for ${key}`);
      winston.error(e);
      return false;
    }
  }

  async del(rawKey) {
    const key = `${this.prefix}/${rawKey}`;
    try {
      await db.del(key);
      winston.silly(`deleted ${key}`);
      return true;
    }
    catch (e) {
      winston.error(`there was an error deleting data for ${key}`);
      winston.error(e);
      return false;
    }
  }
}

LevelDbInterface.instanceFor = function getDbInstance(prefix) {
  return new LevelDbInterface(prefix);
};

module.exports = LevelDbInterface;
