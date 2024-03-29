'use strict';

const fs = require('fs').promises;

const { BaseFile, InvalidFile, BasicFile, Directory, SeriesDirectory, Video, FILETYPES } = require('../models/files');
const logger = require('../logger');
const fileCache = require('./data/fileCache');
const fileUtil = require('../utils/fileUtil');
const videoDataService = require('./dataGatherers/videoDataService');
const thumbnailService = require('./thumbnailService');
const aniListService = require('./dataGatherers/aniListService');
const pendingResourceService = require('./pendingResourceService');
const ONE_DAY = 1000 * 60 * 60 * 24;

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
  const cached = await fileCache.get(filePath);
  if (cached && cached.type === FILETYPES.SERIES) {
    return populateNextAiringEp(cached);
  }
  return cached;
}

async function getFileDetails(filePath, forceRefresh) {
  // ensure we have the right path
  filePath = fileUtil.pathOnServer(filePath);

  // if forceRefresh, we don't get from cache
  if (!forceRefresh) {
    const file = await getCachedFileDetails(filePath);
    if (file !== undefined) {
      return file;
    }
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
    const videoFile = new Video(filePath, stats, videoMetadata, thumbnails);
    videoFile.promised = pendingResourceService.add(promised);
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
  const aniListData = await aniListService.smartSearch(dirFile.name);
  return addAniListDataToDir(aniListData, dirFile, stats);
}

async function addAniListDataToDir(aniListData, dirFile, stats) {
  const series = dirFile.name;
  if (!stats) {
    stats = await fs.stat(dirFile.filePath);
  }

  if (aniListData !== null) {
    // we found a series match!
    const seriesDir = new SeriesDirectory(dirFile.filePath, stats, dirFile.isSeriesLeafNode, aniListData);
    await fileCache.set(seriesDir);
    logger.verbose(`${series} has evolved into SeriesDirectory`);

    // download the banner images
    const downloadedImages = await aniListService.downloadSeriesImages(aniListData);
    seriesDir.aniListData.setLocalImages(...downloadedImages);

    // update the cache again
    await fileCache.set(seriesDir);
    logger.verbose(`${series} is now a series with pictures!`);
    return seriesDir;
  }
  else {
    logger.verbose(`could not guess aniListDb Entry for ${series}`);
  }
}

async function clearAniListData(dirFile) {
  const dirFilePath = dirFile.filePath;
  let stats = await fs.stat(dirFilePath);
  const dir = new Directory(dirFilePath, stats, false);
  await fileCache.set(dir);
  logger.verbose(`${dirFilePath} is no longer a series!`);
}

async function getFileDetailsById(fileId) {
  return await fileCache.getById(fileId);
}

async function populateNextAiringEp(cached) {
  let cachedFor = cached.cachedAt ? Date.now() - cached.cachedAt : ONE_DAY + 1;
  if (cached.aniListData && cached.aniListData.nextAiringEpisode) {
    if (cachedFor > ONE_DAY) {
      logger.info(`getting next ep time for ${cached.aniListData.title}`);
      cached.aniListData.nextAiringEpisode = await aniListService.getNextAiringEp(cached.aniListData.id);
      fileCache.set(cached);
    }
  }
  return cached;
}

module.exports = {
  getFastFileDetails,
  getFileDetails,
  getFileDetailsById,
  addAniListDataToDir,
  clearAniListData
};
