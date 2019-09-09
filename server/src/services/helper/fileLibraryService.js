'use strict';

const fs = require('fs').promises;
const EventEmitter = require('events');
const logger = require('../../logger');
const config = require('../../../config');

const { File, FileType } = require('../../models');
const getVidLen = require('../cli/videoMetadata').duration;
const { pins, watchHistory, fileLibrary } = require('../data');
const fileLibEvents = new EventEmitter();
const EVENTS = {
  FRESH_FILE: 'FRESH_FILE'
};

async function getById(fileId) {
  const filePath = await fileLibrary.getPathFromId(fileId);
  if (filePath === undefined) {
    logger.error(`could not find filePath for ${fileId}`);
    return null;
  }
  return await analyzeFile(filePath);
}

async function getFileOrList(fileOrList) {
  if (Array.isArray(fileOrList)) {
    return await analyzeList(fileOrList);
  }
  return await analyzeFile(fileOrList);
}

async function analyzeFile(filePath, forceRefresh) {
  let fileData;
  // get data from appropriate source
  if (forceRefresh) {
    fileData = await analyzeFromFs(filePath);
  }
  else {
    // grab from db
    fileData = await fileLibrary.get(filePath);

    // read from fs if not there
    if (fileData === undefined) {
      fileData = await analyzeFromFs(filePath);
    }
  }

  return fileData;
}

async function analyzeList(filesArray) {
  const filePromiseArray = filesArray
    .filter(filename => (filename.length > 0)) 
    .filter(item => !(/(^|\/)\.[^/.]/g.test(item)))
    .map((filePath) => (analyzeFile(filePath)));

  return await Promise.all(filePromiseArray);
}

async function analyzeFromFs(filePath) {
  logger.verbose(`analyzing file data for ${filePath}`);

  try {
    let stats = await fs.stat(filePath);
    stats = await accountForBuggyRemoteExecution(stats, filePath);

    const fileObj = new File(filePath, stats);
    await populateMetadata(fileObj);
    //update the cache
    if (fileObj.type !== FileType.DIRECTORY) {
      // i don't need to wait, just need it to run
      await fileLibrary.set(fileObj);
      fileLibEvents.emit(EVENTS.FRESH_FILE);
    }
    return fileObj;
  }
  catch (e) {
    logger.error(`there was an error analyzing the file data for ${filePath}`);
    logger.error(e);
    return new File(filePath);
  }
}

async function populateMetadata(fileObj) {
  let metadata = undefined;
  switch (fileObj.type) {
    case FileType.DIRECTORY:
      const isPinned = await pins.isPinned(fileObj.path);
      const dirContains = await fs.readdir(fileObj.path);
      metadata = {
        isPinned: isPinned,
        fileCount: dirContains.length
      };
      break;
    case FileType.VIDEO:
      const vidLen = await getVidLen(fileObj.path);
      const watchTime = await watchHistory.getWatchTime(fileObj.path);
      metadata = {
        watchTime: watchTime,
        totalTime: vidLen
      };
      break;
    // case FILETYPE.INVALID:
    // case FILETYPE.FILE:
    default:
      metadata = undefined;
  }

  fileObj.setMetadata(metadata);
  return fileObj;
}

async function accountForBuggyRemoteExecution(stats, filePath) {
  if (config.REMOTE_HOST) {
    while (stats === null) {
      stats = await fs.stat(filePath);
    }
  }
  return stats;
}

module.exports = {
  get: getFileOrList,
  getById: getById,
  events: EVENTS,
  emitter: fileLibEvents
};
