'use strict';

const level = require('level');
const winston = require('../winston');

const db = level('windrunner-db', { valueEncoding: 'json'});

async function get(key){
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

async function put(key, data) {
  try {
    await db.put(key, data);
    winston.silly(`put ${key} as ${data}`);
    return true;
  }
  catch (e) {
    console.log(e);
    return false;
  }
}

function getInstance(prefix) {
    return {
        get: (k) => (get(`${prefix}/${k}`)),
        put: (k, d) => (put(`${prefix}/${k}`, d))
    };
}

module.exports = {
  get: get,
  put: put,
  instanceFor: getInstance,
};
