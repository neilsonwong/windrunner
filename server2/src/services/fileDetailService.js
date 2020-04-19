'use strict';

const fs = require('fs').promises;

const { BaseFile, InvalidFile, BasicFile, Directory, SeriesDirectory, Video } = require('../models/files');
const logger = require('../logger');
const fileCache = require('./data/fileCache');
const fileUtil = require('../utils/fileUtil');
const videoDataService = require('./dataGatherers/videoDataService');
const thumbnailService = require('./thumbnailService');
const aniListService = require('./dataGatherers/aniListService');
const pendingResourceService = require('./pendingResourceService');

async function getFastFileDetails(filePath) {
  const file = await getCachedFileDetails(filePath);
  if (file !== undefined) {
    return file;
  }
  const base = new BaseFile(filePath);

  // we want to load these file details in the background 
  const promised = getFileDetails(filePath);
  base.promised = pendingResourceService.add(promised);
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
    return new InvalidFile(filePath);
  }
}

async function getSpecializedFile(filePath, stats) {
  if (stats === null || stats === undefined) {
    return new BaseFile(filePath);
  }
  else if (stats.isDirectory()) {
    const isSeries = await isSeriesLeafNode(filePath);
    const dirFile = new Directory(filePath, stats, isSeries);
    if (isSeries) {
      // don't wait for this promise, it will complete by itself and update the cache later
      // we don't REALLY need to pass the stats, but i have it, so i will use it
      const promised = tryToEvolveDir(dirFile, stats);
      dirFile.promised = pendingResourceService.add(promised);
    }
    return dirFile;
  }
  else if (videoDataService.isVideo(filePath)) {
    const videoMetadata = await videoDataService.getVideoMetadata(filePath);

    // start generating thumbnails
    const { thumbnails, promised } = thumbnailService.generateThumbnails(filePath, videoMetadata);
    videoFile.promised = pendingResourceService.add(promised);
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

async function tryToEvolveDir(dirFile, stats) {
  const series = dirFile.name;
  const aniListData = await aniListService.smartSearch(series);
  if (aniListData !== null) {
    // we found a series match!
    const seriesDir = new SeriesDirectory(dirFile.filePath, stats, dirFile.isSeriesLeafNode, aniListData);
    await fileCache.set(seriesDir);
    logger.verbose(`${series} has evolved into SeriesDirectory`);
    // download the banner images
    const downloadedImages = await aniListService.downloadSeriesImages(aniListData);
    seriesDir.aniListData.setLocalImages(...downloadedImages);
    await fileCache.set(seriesDir);
    return seriesDir;
  }
  else {
    logger.verbose(`could not guess aniListDb Entry for ${series}`);
  }
}

module.exports = {
  getFastFileDetails,
  getFileDetails
};
