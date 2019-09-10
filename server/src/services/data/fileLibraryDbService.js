'use strict';

const logger = require('../../logger');
const fileLibraryDb = require('./levelDbService').instanceFor('fileLibrary');
const fileIndexDb = require('./levelDbService').instanceFor('fileLibraryIndex');

async function getFile(filePath) {
  return await fileLibraryDb.get(filePath);
}

async function setFile(fileObj) {
  if (fileObj.id) {
    // add id
    await fileLibraryDb.put(fileObj.path, fileObj);
    return await fileIndexDb.put(fileObj.id, fileObj.path);
  }
  else {
    logger.error('attempt to setFile without fileId in fileObj');
  }
}

async function evictFile(filePath) {
  logger.verbose(`evicting ${filePath} from fileLibrary`);
  return await fileLibraryDb.del(filePath);
}

async function getPathFromId(fileId) {
  return await fileIndexDb.get(fileId);
}

async function getById(fileId) {
  const filePath = await fileIndexDb.get(fileId);
  return await getFile(filePath);
}

module.exports = {
  get: getFile,
  set: setFile,
  evict: evictFile,
  getById: getById,
  getPathFromId, getPathFromId,
};
