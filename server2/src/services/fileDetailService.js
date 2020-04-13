'use strict';

const fs = require('fs').promises;

const { BaseFile, BasicFile, Directory, Video } = require('../models/files');
const logger = require('../logger');
const fileCache = require('./data/fileCache');
const fileUtil = require('../utils/fileUtil');
const videoDataService = require('./videoDataService');
const thumbnailService = require('./thumbnailService');

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
    const isSeries = await isSeriesLeafNode(filePath);
    return new Directory(filePath, stats, isSeries);
  }
  else if (videoDataService.isVideo(filePath)) {
    const videoMetadata = await videoDataService.getVideoMetadata(filePath);

    // start generating thumbnails
    const thumbnails = thumbnailService.generateThumbnails(filePath, videoMetadata);
    const videoFile = new Video(filePath, stats, videoMetadata, thumbnails);
    return videoFile;
  }
  else {
    return new BasicFile(filePath, stats);
  }
}

async function isSeriesLeafNode(filePath) {
  const files = await fs.readdir(filePath);
  if (files && files.length > 0) {
    const folderMakeup = {
      video: 0,
      other: 0,
      total: 0
    };
    const finalMakeUp = files
      .filter(fileName => (fileName.length > 0))
      .filter(item => !(/(^|\/)\.[^/.]/g.test(item)))
      .reduce((accumulator, fileName) => {
        if (videoDataService.isVideo(fileName)) {
          ++accumulator.video;
        }
        else {
          ++accumulator.other;
        }
        ++accumulator.total;
        return accumulator;
      }, folderMakeup);
    return finalMakeUp.video * 2 > finalMakeUp.total;
  }
  return false;
}

module.exports = {
  getFastFileDetails,
  getFileDetails
};
