'use strict';

const fs = require('fs').promises;
const winston = require('winston');

const File = require('../models/File');
const Folder = require('../models/Folder');
const Video = require('../models/Video');
const utility = require('../utils/utility');
const getVidLen = require('../services/videoMetadataService').duration;
const userConsumptionService = require('./userConsumptionService');
const fileLibraryDb = require('./levelDbService').instanceFor('fileLibrary');

async function analyze(file, forceRefresh) {
  let fileData;
  // get data from appropriate source
  if (forceRefresh) {
    fileData = await analyzeFromFs(file);
  }
  else {
    // grab from db
    fileData = await fileLibraryDb.get(file);

    // read from fs if not there
    if (fileData === undefined) {
      fileData = await analyzeFromFs(file);
    }
  }

  return fileData;
}

async function analyzeFromFs(file) {
  let data;
  try {
    const stats = await fs.stat(file);

    if (stats.isDirectory()) {
      let isPinned = await userConsumptionService.isPinned(file);
      data = new Folder(file, stats, isPinned);
    }
    else if (utility.isVideo.test(file)) {
      let vidLen = await getVidLen(file);
      let watchTime = await userConsumptionService.getWatchTime(file);
      data = new Video(file, stats, vidLen, watchTime);
    }
    else {
      data = new File(file, stats);
    }

    // update cache only if it's not a bad case
    await fileLibraryDb.put(file, data);
  }
  catch (e) {
    data = new File(file, stats);
  }

  return data;
}

async function analyzeFiles(filesArray) {
    const filePromiseArray = filesArray
        .filter(filename => (filename.length > 0)) 
        .filter(item => !(/(^|\/)\.[^\/\.]/g.test(item)))
        .map((fileName) => (analyze(fileName)));

    return await Promise.all(filePromiseArray);
}

async function evictFile(file) {
  return await fileLibraryDb.del(file);
}

module.exports = {
	analyze: analyze,
  analyzeList: analyzeFiles,
  evictFile: evictFile,
};