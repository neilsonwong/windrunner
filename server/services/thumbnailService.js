'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const winston = require('../winston');
const executor = require('../utils/executor');
const videoMetaDataService = require('./videoMetadataService');
const config = require('../config');

async function makeThumbnails(filePath) {
  winston.debug(`generating thumbnails for ${filePath}`);

  const fileName = path.basename(filePath);
  const imgFolder = path.join(config.THUMBNAIL_DIR, fileName);
  let vidLen = await videoMetaDataService.duration(filePath);
  if (vidLen === -1) {
    vidLen = 1200;
  }
  const thumbnailTimeUnit = Math.floor(vidLen / (config.MAX_THUMBNAILS + 1));
  const thumbnailPromises = [];

  for (let i = 0; i < config.MAX_THUMBNAILS; ++i) {
    //calculate time splits
    const frameRipTime = secondsToHms(thumbnailTimeUnit * (i+1));
    const outputPath =  path.join(imgFolder, frameRipTime.replace(/:/g, '_') + '.jpg');

    thumbnailPromises.push(
      executor.run('ffmpeg', 
      ['-ss', frameRipTime, '-t', '1', '-i', filePath, '-s', '320x180', '-f', 'mjpeg', outputPath]));
  }

  return await Promise.all(thumbnailPromises);
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

module.exports = {
  makeThumbnails: makeThumbnails,
};

async function main() {
  await makeThumbnails('/mnt/c/Users/Neilson/Torrents/[Nep_Blanc] Trinity Seven OVA .mkv');
}
