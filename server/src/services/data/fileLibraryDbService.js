'use strict';

const logger = require('../../logger');
const fileLibraryDb = require('./levelDbService').instanceFor('fileLibrary');
const fileIndexDb = require('./levelDbService').instanceFor('fileLibraryIndex');

async function getFile(file) {
  return await fileLibraryDb.get(file);
}

async function setFile(fileObj) {
  if (fileObj.id) {
    // add id
    await fileLibraryDb.put(fileObj.id, fileObj);
    return await fileIndexDb.put(fileObj.path, fileObj.id);
  }
  else {
    logger.error('attempt to setFile without fileId in fileObj');
  }
}

async function evictFile(file) {
  logger.verbose(`evicting ${file} from fileLibrary`);
  return await fileLibraryDb.del(file);
}

async function findId(filePath) {
  return await fileIndexDb.get(filePath);
}

module.exports = {
  get: getFile,
  set: setFile,
  evict: evictFile,
  findId: findId,
};
