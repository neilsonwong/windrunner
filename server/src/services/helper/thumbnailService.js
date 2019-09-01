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

async function makeThumbnails(fileId) {
  const fileObj = await fileLibrary.getById(fileId);
  const filePath = fileObj.path;
  const fileName = path.basename(filePath);
  const thumbs = await thumbnailsExist(fileName);
  if (thumbs === false) {
    // check if we have the thumbnails and whether they have been generated already
    logger.verbose(`generating thumbnails for ${filePath}`);

    const imgFolder = path.join(config.THUMBNAIL_DIR, fileName);
    let vidLen = await videoMetadata.duration(filePath);
    if (vidLen === -1) {
      vidLen = 1200;
    }
    const thumbnailTimeUnit = Math.floor(vidLen / (config.MAX_THUMBNAILS + 1));
    const thumbnailPromises = [];
    const outputFiles = [];

    //ensure output dir exists
    try {
      await fs.mkdir(imgFolder, {recursive: true});

      for (let i = 0; i < config.MAX_THUMBNAILS; ++i) {
        //calculate time splits
        const frameRipTime = secondsToHms(thumbnailTimeUnit * (i+1));
        const outFileName = frameRipTime.replace(/:/g, '_') + '.jpg';
        const outputPath =  path.join(imgFolder, outFileName);

        thumbnailPromises.push(thumbnailer.generateThumbnail(filePath, outputPath, frameRipTime));
        outputFiles.push(outFileName);
      }

      await Promise.all(thumbnailPromises);
      await thumbnails.setThumbnailList(fileId, outputFiles);
      await minifyFolder(imgFolder);
      logger.verbose(`successfully generated thumbnails for ${filePath}`);
    }
    catch (e) {
      logger.error(`there was an error when generating thumbnails for ${filePath}`);
      logger.error(e);
    }
  }
  else {
    logger.debug(`thumbnails already exist for ${filePath}`);
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
  const fileObj = fileLibrary.getById(fileId);
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

module.exports = {
  makeThumbnails: makeThumbnails,
  getThumbnailList: getThumbnailList,
  getThumbnailPath: getThumbnailPath,
};

// async function main() {
//   await makeThumbnails('/mnt/c/Users/Neilson/Torrents/[Nep_Blanc] Trinity Seven OVA .mkv');
// }
