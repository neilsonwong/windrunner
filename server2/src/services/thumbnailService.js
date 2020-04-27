'use strict';

const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const imagemin = require('imagemin');
// const imageminJpegtran = require('imagemin-jpegtran');
const imageminWebp = require('imagemin-webp');

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
    const thumbnailPromises = Promise.all(
      thumbnailIds.map((thumbnailId, i) => {
        return getThumbnailCreationPromise(thumbnailId, i, filePath, thumbnailTimeUnit);
      }));

    return {
      thumbnails: thumbnailIds,
      promised: thumbnailPromises
    };
  }
  catch (e) {
    logger.error(`there was an error when generating thumbnails for ${filePath}`);
    logger.error(e);
  }
}

async function getThumbnailCreationPromise(thumbnailId, i, filePath, thumbnailTimeUnit) {
  //calculate time splits
  const frameRipTime = msToHms(thumbnailTimeUnit * (i + 1));
  const outFileName = thumbnailId + '.jpg';
  const outputPath = path.join(THUMBNAIL_BASE, outFileName);
  const finalOutFileName = thumbnailId + '.webp';
  // const finalOutputPath = path.join(THUMBNAIL_BASE, finalOutFileName);
  await generateThumbnail(filePath, outputPath, frameRipTime);
  await minifyFile(outputPath, true);
  return finalOutFileName;
}

function getThumbnailProgress(imageId) {
  if (inProgress.has(imageId)) {
    const thumbnailPromise = inProgress.get(imageId);
    if (typeof thumbnailPromise === 'number') {
      return thumbnailPromise;
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
      plugins: [imageminWebp()]
    });
    logger.verbose(`image compression complete for ${folder}`);
  }
  catch (e) {
    logger.warn('an error occurred when minifying the images');
    logger.warn(e);
  }
}

async function minifyFile(filePath, deleteAfter) {
  const folder = path.dirname(filePath);
  try {
    await imagemin([filePath], {
      destination: folder,
      plugins: [imageminWebp()]
    });
    // delete the file
    if (deleteAfter) {
      await fs.unlink(filePath);
    }
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
