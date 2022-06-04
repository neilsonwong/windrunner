'use strict';

const logger = require('../../logger');
const fileLibraryDb = require('./levelDbService').instanceFor('fileLibrary');
const fileIndexDb = require('./levelDbService').instanceFor('fileLibraryIndex');
const pendingResourceService = require('../pendingResourceService');

async function getFile(filePath) {
  const file = await fileLibraryDb.get(filePath);
  if (file && file.promised && pendingResourceService.getStatus(file.promised)) {
    // console.log('clearing finished promise from fileObj');
    file.promised = undefined;
    setFile(file);
  }
  return file;
}

async function setFile(fileObj) {
  if (fileObj.id) {
    // don't save the promise if it's done already
    if (pendingResourceService.getStatus(fileObj.promised)) {
      // console.log('clearing finished promise from fileObj');
      fileObj.promised = undefined;
    }

    // add date
    fileObj.cachedAt = Date.now();
    
    // add id
    await Promise.all([
      fileLibraryDb.put(fileObj.filePath, fileObj), 
      fileIndexDb.put(fileObj.id, fileObj.filePath)
    ]);
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

async function getAll() {
  const allFiles = await fileLibraryDb.all();
  return (allFiles === undefined) ? [] : allFiles;
}


module.exports = {
  get: getFile,
  set: setFile,
  evict: evictFile,
  getById: getById,
  getPathFromId, getPathFromId,
  all: getAll
};
