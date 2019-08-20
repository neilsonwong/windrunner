'use strict';

const fs = require('fs').promises;
const path = require('path');

const { search } = require('../cli/fileList');
const fileLibrary = require('../helper/fileLibraryService');
const winston = require('../../logger');

const SHARE_PATH = require('../../../config').SHARE_PATH;

//file should be an absolute path relative to the share
async function nativels(rel) {
  // get file path
  const dirPath = path.join(SHARE_PATH, rel);
    
  try {
    const dirStats = await fs.stat(dirPath);
    if (dirStats.isDirectory()) {
      const fileNames = await fs.readdir(dirPath);
      // transform the listing to a files array
      return await fileLibrary.analyzeList(fileNames
        .map(fileNameOnly => (path.join(dirPath, fileNameOnly))));
    }
  }
  catch(e) {
    winston.error(`an error occured while listing the files for ${rel}`);
    winston.error(e);
  }

  //no more 'ls'ing files, screw that
  return [];
}

//find files in a dir
async function find(q){
  if (q === ''){
    winston.verbose('no query passed into find function');
    return [];
  }
  else {
    try {
      //find all absolute file paths
      const results = await search(q);
      return results.length === 0 ? [] :
        await fileLibrary.analyzeList(results);
    }
    catch(e){
      winston.error(`an error occured while searching all files for ${q}`);
      winston.error(e);
    }
  }
}

module.exports = {
  ls: nativels,
  find: find
};

/*
async function testLs(rel) {
    console.time('node ls');
    await nativels(rel);
    console.timeEnd('node ls');

    console.time('raw ls');
    await cliLs(rel);
    console.timeEnd('raw ls');
}

testLs('anime');

// too slow to be usable
async function cliLs(rel) {
  // get file path
  const dirPath = path.join(SHARE_PATH, rel);
  try {
    //find all absolute file paths
    const results = await list(dirPath);
    return results.length === 0 ? [] :
      await fileLibraryService.analyzeList(results);
  }
  catch(e){
    winston.error(`an error occured while listing all files for ${rel}`);
    winston.error(e);
  }
}

*/
