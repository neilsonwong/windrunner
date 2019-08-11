'use strict';

const level = require('level');

const db = level('windrunner-db', { valueEncoding: 'json'});

async function getFile(filename){
  try {
    let fileData = await db.get(filename);
    return fileData;
  }
  catch (e) {
    if (e.type !== 'NotFoundError') {
      console.log(e);
    }
    return undefined;
  }
}

async function putFile(filename, data) {
  try {
    await db.put(filename, data);
    return true;
  }
  catch (e) {
    console.log(e);
    return false;
  }
}

module.exports = {
  get: getFile,
  put: putFile,
};
