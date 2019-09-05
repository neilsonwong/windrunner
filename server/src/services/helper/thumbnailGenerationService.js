'use strict';

const path = require('path');
const fs = require('fs').promises;
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');

const config = require('../../../config');
const logger = require('../../logger');
const { thumbnailer, videoMetadata } = require('../cli');
const { thumbnails } = require('../data');
const fileLibrary = require('./fileLibraryService');

// we want to return two promises
// 1 for full generation of 1st thumbnail
// 1 for full generation of all thumbnails
async function makeThumbnails(fileId) {
  const fileObj = await fileLibrary.getById(fileId);
  if (await thumbnailsExist(fileId) === false) {
    // check if we have the thumbnails and whether they have been generated already
    logger.verbose(`generating thumbnails for ${fileObj.path}`);

    // use filename for folder name, for debugging clarity
    const imgFolder = path.join(config.THUMBNAIL_DIR, fileObj.name);
    // we should already have the vid len in the fileObj
    const vidLen = (fileObj.metadata && fileObj.metadata.totalTime && 
      fileObj.metadata.totalTime !== -1) ? fileObj.metadata.totalTime : 1200;

    const thumbnailTimeUnit = Math.floor(vidLen / (config.MAX_THUMBNAILS + 1));

    const thumbnailPromises = [];
    const outputFiles = [];

    try {
      // ensure output dir exists
      await fs.mkdir(imgFolder, {recursive: true});

      for (let i = 0; i < config.MAX_THUMBNAILS; ++i) {
        //calculate time splits
        const frameRipTime = secondsToHms(thumbnailTimeUnit * (i+1));
        const outFileName = frameRipTime.replace(/:/g, '_') + '.jpg';
        const outputPath =  path.join(imgFolder, outFileName);
        thumbnailPromises.push(thumbnailer.generateThumbnail(fileObj.path, outputPath, frameRipTime, i === 0));
        outputFiles.push(outFileName);
      }

      const firstThumbOutput = path.join(imgFolder, outputFiles[0]);
      const firstThumbPromise = thumbnailPromises[0]
        .then(() => (minifyFile(firstThumbOutput)))
        .then(() => (thumbnails.setThumbnailList(fileId, [outputFiles[0]])))
        .then(() => { logger.verbose(`successfully generated first thmb for ${fileObj.path}`); });
     
      const allThumbsDone = Promise.all(thumbnailPromises)
        .then(() => (minifyFolder(imgFolder)))
        .then(() => (thumbnails.setThumbnailList(fileId, outputFiles)))
        .then(() => { logger.verbose(`successfully generated thumbnails for ${fileObj.path}`); });
      
      return [firstThumbPromise, allThumbsDone];
    }
    catch (e) {
      logger.error(`there was an error when generating thumbnails for ${fileObj.path}`);
      logger.error(e);
    }
  }
  else {
    logger.debug(`thumbnails already exist for ${fileObj.path}`);
    return [true, true];
  }
}

async function thumbnailsExist(fileId) {
  const thumbList = await getThumbnailList(fileId);
  return (thumbList.length === config.MAX_THUMBNAILS);
}

async function getThumbnailList(fileId) {
  return await thumbnails.getThumbnailList(fileId);
}

function secondsToHms(d) {
  d = Number(d);

  const h = zeroPad(Math.floor(d / 3600));
  const m = zeroPad(Math.floor(d % 3600 / 60));
  const s = zeroPad(Math.floor(d % 3600 % 60));

  return `${h}:${m}:${s}`;
}

function zeroPad(n) {
  return ('0' + n).slice(-2);
}

async function getThumbnailPath(fileId, imgFile) {
  const thumbList = await getThumbnailList(fileId);
  const fileObj = await fileLibrary.getById(fileId);
  if (thumbList.includes(imgFile)) {
    return path.join(config.THUMBNAIL_DIR, fileObj.name, imgFile);
  }
  return null;
}

async function minifyFolder(folder) {
  const jpgWildCard = path.join(folder, '*.jpg');
  try {
    await imagemin([jpgWildCard], {
      destination: folder,
      plugins: [ imageminJpegtran() ]
    });
    logger.verbose(`image compression complete for ${folder}`);
  }
  catch (e) {
    logger.warn('an error occurred when minifying the images');
    logger.warn(e);
  }
}

async function minifyFile(filePath) {
  const folder = path.dirname(filePath);
  try {
    await imagemin([filePath], {
      destination: folder,
      plugins: [ imageminJpegtran() ]
    });
    logger.verbose(`image compression complete for ${filePath}`);
  }
  catch (e) {
    logger.warn(`an error occurred when minifying the image ${filePath}`);
    logger.warn(e);
  }
}

module.exports = {
  makeThumbnails: makeThumbnails,
  getThumbnailList: getThumbnailList,
  getThumbnailPath: getThumbnailPath,
};

// async function main() {
//   await makeThumbnails('/mnt/c/Users/Neilson/Torrents/[Nep_Blanc] Trinity Seven OVA .mkv');
// }
