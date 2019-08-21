'use strict';

const fs = require('fs').promises;
const logger = require('../../logger');
const config = require('../../../config');

const { File, Folder, Video } = require('../../models');
const { isVideo } = require('../../utils');
const getVidLen = require('../cli/videoMetadata').duration;
const { pins, watchHistory, fileLibrary } = require('../data');

async function getFileOrList(fileOrList) {
  if (Array.isArray(fileOrList)) {
    return await analyzeList(fileOrList);
  }
  return await analyzeFile(fileOrList);
}

async function analyzeFile(file, forceRefresh) {
  let fileData;
  // get data from appropriate source
  if (forceRefresh) {
    fileData = await analyzeFromFs(file);
  }
  else {
    // grab from db
    fileData = await fileLibrary.get(file);

    // read from fs if not there
    if (fileData === undefined) {
      fileData = await analyzeFromFs(file);
    }
  }

  return fileData;
}

async function analyzeList(filesArray) {
  const filePromiseArray = filesArray
    .filter(filename => (filename.length > 0)) 
    .filter(item => !(/(^|\/)\.[^/.]/g.test(item)))
    .map((fileName) => (analyzeFile(fileName)));

  return await Promise.all(filePromiseArray);
}

async function analyzeFromFs(file) {
  logger.verbose(`analyzing file data for ${file}`);

  try {
    let stats = await fs.stat(file);
    stats = await accountForBuggyRemoteExecution(stats, file);

    const data = await specializedFile(file, stats);
    //update the cache
    await fileLibrary.set(file, data);
    return data;
  }
  catch (e) {
    logger.error(`there was an error analyzing the file data for ${file}`);
    logger.error(e);
    console.log(e);
    return new File(file);
  }
}

async function specializedFile(file, stats) {
  if (stats.isDirectory()) {
    const isPinned = await pins.isPinned(file);
    return new Folder(file, stats, isPinned);
  }
  else if (isVideo(file)) {
    const vidLen = await getVidLen(file);
    const watchTime = await watchHistory.getWatchTime(file);
    return new Video(file, stats, vidLen, watchTime);
  }
  else {
    // generic file type
    return new File(file, stats);
  }
}

async function accountForBuggyRemoteExecution(stats, file) {
  if (config.REMOTE_HOST) {
    while (stats === null) {
      stats = await fs.stat(file);
    }
  }
  return stats;
}

module.exports = {
  get: getFileOrList
};
