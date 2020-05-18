'use strict';

const level = require('level');
const logger = require('../../logger');
const { DB_PATH } = require('../../../config');

const db = level(DB_PATH, { valueEncoding: 'json' });

class LevelDbInterface {
  constructor(prefix) {
    this.prefix = prefix ? prefix : '';
    this.delimiter = ':';
  }

  async get(rawKey) {
    const key = `${this.prefix}${this.delimiter}${rawKey}`;
    try {
      const data = await db.get(key);
      logger.silly(`leveldb data for ${key} is ${data}`);
      return data;
    }
    catch (e) {
      if (e.type !== 'NotFoundError') {
        logger.silly(`no entry for ${key} in leveldb`);
      }
      return undefined;
    }
  }

  async all() {
    const getAllPromise = new Promise((res, rej) => {
      const prefixWithDelim = `${this.prefix}${this.delimiter}`;
      const streamVals = {};
      db.createReadStream({
        gte: prefixWithDelim,
        lte: prefixWithDelim + '~' // TODO: fix this temp hack for now
      })
      .on('data', function (data) {
        streamVals[data.key] = data.value;
      })
      .on('error', function (err) {
        logger.warn('get all stream encountered an error');
        rej(err);
      })
      .on('close', () => {
        logger.silly('get all stream closed');
      })
      .on('end', () => {
        logger.silly('get all stream ended');
        res(streamVals);
      });
    });
    return await getAllPromise;
  }

  async put(rawKey, data) {
    const key = `${this.prefix}${this.delimiter}${rawKey}`;
    try {
      await db.put(key, data);
      logger.silly(`put ${key} as ${data}`);
      return true;
    }
    catch (e) {
      logger.error(`there was an error when putting data for ${key}`);
      logger.error(e);
      return false;
    }
  }

  async del(rawKey) {
    const key = `${this.prefix}${this.delimiter}${rawKey}`;
    try {
      await db.del(key);
      logger.silly(`deleted ${key}`);
      return true;
    }
    catch (e) {
      logger.error(`there was an error deleting data for ${key}`);
      logger.error(e);
      return false;
    }
  }
}

LevelDbInterface.instanceFor = function getDbInstance(prefix) {
  return new LevelDbInterface(prefix);
};

module.exports = LevelDbInterface;
