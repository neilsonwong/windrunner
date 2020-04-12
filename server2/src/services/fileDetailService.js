'use strict';

const fs = require('fs').promises;

const { BaseFile, BasicFile, Directory, Video } = require('../models/files');
const logger = require('../logger');
const fileCache = require('./data/fileCache');
const fileUtil = require('../utils/fileUtil');
const videoDataService = require('./videoDataService');

async function getFastFileDetails(filePath) {
  const file = await getCachedFileDetails(filePath);
  if (file !== undefined) {
    return file;
  }
  const base = new BaseFile(filePath);
  return base;
}

async function getCachedFileDetails(filePath) {
  return await fileCache.get(filePath);
}

async function getFileDetails(filePath) {
  // ensure we have the right path
  filePath = fileUtil.pathOnServer(filePath);
  const file = await getCachedFileDetails(filePath);
  if (file !== undefined) {
    return file;
  }

  try {
    const stats = await fs.stat(filePath);
    const file = await getSpecializedFile(filePath, stats);
    await fileCache.set(file);
    return file;
  }
  catch (e) {
    logger.error(`there was an error analyzing the file data for ${filePath}`);
    logger.error(e);
    return new BasicFile(filePath);
  }
}

async function getSpecializedFile(filePath, stats) {
  if (stats === null || stats === undefined) {
    return new BaseFile(filePath);
  }
  else if (stats.isDirectory()) {
    return new Directory(filePath, stats);
  }
  else if (videoDataService.isVideo(filePath)) {
    const videoMetadata = await videoDataService.getVideoMetadata(filePath);
    return new Video(filePath, stats, videoMetadata);
  }
  else {
    return new BasicFile(filePath, stats);
  }
}

module.exports = {
  getFastFileDetails,
  getFileDetails
};
