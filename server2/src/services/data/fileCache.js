'use strict';

const logger = require('../../logger');
const fileLibraryDb = require('./levelDbService').instanceFor('fileLibrary');
const fileIndexDb = require('./levelDbService').instanceFor('fileLibraryIndex');

function getFile(filePath) {
  return fileLibraryDb.get(filePath);
}

async function setFile(fileObj) {
  if (fileObj.id) {
    // never save promised
    const savedPromised = fileObj.promised;
    fileObj.promised = undefined;
    
    // add id
    await Promise.all([
      fileLibraryDb.put(fileObj.filePath, fileObj), 
      fileIndexDb.put(fileObj.id, fileObj.filePath)
    ]);

    // restore the promise object so we don't have to clone
    fileObj.promised = savedPromised;
  }
  else {
    logger.error('attempt to setFile without fileId in fileObj');
  }
}

function evictFile(filePath) {
  logger.verbose(`evicting ${filePath} from fileLibrary`);
  return fileLibraryDb.del(filePath);
}

function getPathFromId(fileId) {
  return fileIndexDb.get(fileId);
}

async function getById(fileId) {
  const filePath = await fileIndexDb.get(fileId);
  return getFile(filePath);
}

module.exports = {
  get: getFile,
  set: setFile,
  evict: evictFile,
  getById: getById,
  getPathFromId, getPathFromId,
};
