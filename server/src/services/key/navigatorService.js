'use strict';

const fs = require('fs').promises;
const path = require('path');

const { search, changed } = require('../cli/fileList');
// const fileLibrary = require('../helper/fileLibraryService');
const librarian = require('../passive/librarianService');
const logger = require('../../logger');

const SHARE_PATH = require('../../../config').SHARE_PATH;

//file should be an absolute path relative to the share
async function nativels(rel) {
  // get file path
  const dirPath = (rel.indexOf(SHARE_PATH) === 0) ? rel :
    path.join(SHARE_PATH, rel);
    
  try {
    const dirStats = await fs.stat(dirPath);
    if (dirStats.isDirectory()) {
      const fileNames = await fs.readdir(dirPath);
      // transform the listing to a files array
      return await fileLibrary.get(fileNames
        .map(fileNameOnly => (path.join(dirPath, fileNameOnly))));
    }
  }
  catch(e) {
    logger.error(`an error occured while listing the files for ${rel}`);
    logger.error(e);
  }

  //no more 'ls'ing files, screw that
  return [];
}

//find files in a dir
async function find(q){
  if (q === ''){
    logger.verbose('no query passed into find function');
    return [];
  }
  else {
    try {
      //find all absolute file paths
      const results = await search(q);
      return results.length === 0 ? [] :
        await fileLibrary.get(results);
    }
    catch(e) {
      logger.error(`an error occured while searching all files for ${q}`);
      logger.error(e);
    }
  }
}

async function recent() {
  try {
    //find all absolute file paths
    const results = await changed(q);
    return results.length === 0 ? [] :
      await fileLibrary.get(results);
  }
  catch(e) {
    logger.error(`an error occured while finding recently changed files`);
    logger.error(e);
  }
}

module.exports = {
  ls: nativels,
  find: find,
  recent: recent
};
