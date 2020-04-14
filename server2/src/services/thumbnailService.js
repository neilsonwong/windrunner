'use strict';

const path = require('path');
const { v4: uuidv4 } = require('uuid');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');

const logger = require('../logger');
const { THUMBNAIL_BASE, MAX_THUMBNAILS } = require('../../config.json');
const executor = require('./cli/executor');

const inProgress = new Map();

function generateThumbnail(filePath, outputPath, frameRipTime) {
  const cmd = 'ffmpeg';
  const args = ['-ss', frameRipTime, // set the time we want
    '-t', '1', '-i', filePath, '-s', '426x240', '-f', 'mjpeg', outputPath,
    '-y', // say yes to overwrite
    '-loglevel', 'error' // hide all output except true errors since ffmpeg pipes stdout to stderr instead
  ];
  return executor.run(cmd, args);
}

function generateThumbnails(filePath, videoMetadata) {
  const vidLen = (videoMetadata && videoMetadata.duration !== -1) ?
    videoMetadata.duration :
    1200;

  const thumbnailTimeUnit = Math.floor(vidLen / (MAX_THUMBNAILS + 1));
  const thumbnailIds = Array(MAX_THUMBNAILS).fill().map(() => uuidv4());

  try {
    const thumbnailPromises = thumbnailIds
      .map((thumbnailId, i) => getThumbnailCreationPromise(thumbnailId, i, filePath, thumbnailTimeUnit));
    return thumbnailIds;
  }
  catch (e) {
    logger.error(`there was an error when generating thumbnails for ${filePath}`);
    logger.error(e);
  }
}

function getThumbnailCreationPromise(thumbnailId, i, filePath, thumbnailTimeUnit) {
  //calculate time splits
  const frameRipTime = msToHms(thumbnailTimeUnit * (i + 1));
  const outFileName = thumbnailId + '.jpg';
  const outputPath = path.join(THUMBNAIL_BASE, outFileName);
  const thumbPromise = generateThumbnail(filePath, outputPath, frameRipTime)
    .then(() => (minifyFile(outputPath)))
    .then(() => {
      inProgress.set(thumbnailId, Date.now());
    });

  inProgress.set(thumbnailId, thumbPromise);
  return thumbPromise;
}

function getThumbnailProgress(imageId) {
  if (inProgress.has(imageId)) {
    const thumbnailPromise = inProgress.get(imageId);
    if (typeof thumbnailPromise === 'number') {
      return true;
    }
    else {
      return false;
    }
  }
  return true;
}

function pruneInProgress() {

}

async function minifyFolder(folder) {
  const jpgWildCard = path.join(folder, '*.jpg');
  try {
    await imagemin([jpgWildCard], {
      destination: folder,
      plugins: [imageminJpegtran()]
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
      plugins: [imageminJpegtran()]
    });
    logger.verbose(`image compression complete for ${filePath}`);
  }
  catch (e) {
    logger.warn(`an error occurred when minifying the image ${filePath}`);
    logger.warn(e);
  }
}

function msToHms(d) {
  d = Number(d);
  d = Math.floor(d / 1000);

  const h = zeroPad(Math.floor(d / 3600));
  const m = zeroPad(Math.floor(d % 3600 / 60));
  const s = zeroPad(Math.floor(d % 3600 % 60));

  return `${h}:${m}:${s}`;
}

function zeroPad(n) {
  return ('0' + n).slice(-2);
}

module.exports = {
  generateThumbnails,
  getThumbnailProgress
};