'use strict';

const fs = require('fs').promises;
const path = require('path');

const config = require('../config');
const winston = require('../winston');

const listAll = require('./cli/fileList').listAll;
const thumbnailer = require('./cli/thumbnailer');
const videoMetaDataService = require('./cli/videoMetadata');
const thumbnailDb = require('./levelDbService').instanceFor('thumbnails');
const utils = require('../utils');

const bgWorker = require('./cli/backgroundWorkerService');
const scheduler = require('./schedulerService');

async function makeThumbnails(filePath) {
  const fileName = path.basename(filePath);
  const thumbs = await thumbnailsExist(fileName)
  if (thumbs === false) {
    // check if we have the thumbnails and whether they have been generated already
    winston.verbose(`generating thumbnails for ${filePath}`);

    const imgFolder = path.join(config.THUMBNAIL_DIR, fileName);
    let vidLen = await videoMetaDataService.duration(filePath);
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
      await thumbnailDb.put(fileName, outputFiles);
      winston.verbose(`successfully generated thumbnails for ${filePath}`);
    }
    catch (e) {
      winston.error(`there was an error when generating thumbnails for ${filePath}`);
      winston.error(e);
    }
  }
  else {
    winston.debug(`thumbnails already exist for ${filePath}`);
  }
}

async function thumbnailsExist(fileName) {
  const thumbList = await getThumbnailList(fileName);
  return (thumbList.length === config.MAX_THUMBNAILS);
}

async function getThumbnailList(fileName) {
  const thumbList = await thumbnailDb.get(fileName);
  return (thumbList === undefined) ? [] : thumbList;
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

async function getThumbnailPath(fileName, imgFile) {
  const thumbList = await getThumbnailList(fileName);
  if (thumbList.includes(imgFile)) {
    return path.join(config.THUMBNAIL_DIR, fileName, outFileName);
  }
  return null;
}

//perhaps move this into an init and use the scheduler or something
async function quietlyGenerateThumbnails() {
  try {
    const allFiles = await listAll(config.SHARE_PATH);
    allFiles.split('\n')
      .filter(fileName => (fileName.length > 0)) 
      .filter(fileName => (utils.isVideo(fileName)))
      .filter(async (fileName) => {
        const exists = await thumbnailsExist(fileName);
        return !exists;
      })
      .forEach((fileName) => {
        bgWorker.addBackgroundTask(makeThumbnails.bind(null, fileName));
      });
  }
  catch(e) {
    winston.error('there was an issue quietly generating thumbnails in the background');
    winston.error(e);
  }
}

function startBackgroundTask() {
	scheduler.addTask('thumbnail bg worker', quietlyGenerateThumbnails, 3600000);
}

module.exports = {
  makeThumbnails: makeThumbnails,
  getThumbnailList: getThumbnailList,
  getThumbnailPath: getThumbnailPath,
  startBackgroundTask: startBackgroundTask,
};

async function main() {
  await makeThumbnails('/mnt/c/Users/Neilson/Torrents/[Nep_Blanc] Trinity Seven OVA .mkv');
}
