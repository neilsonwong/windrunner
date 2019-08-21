'use strict';

const logger = require('../../logger');
const fileLibraryDb = require('./levelDbService').instanceFor('fileLibrary');

async function getFile(file) {
  return await fileLibraryDb.get(file);
}

async function setFile(file, data) {
  return await fileLibraryDb.put(file, data);
}

async function evictFile(file) {
  logger.verbose(`evicting ${file} from fileLibrary`);
  return await fileLibraryDb.del(file);
}

module.exports = {
  get: getFile,
  set: setFile,
  evict: evictFile,
};
