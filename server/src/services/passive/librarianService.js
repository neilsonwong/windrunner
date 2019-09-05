'use strict';

const config = require('../../../config');
const logger = require('../../logger');
const { listAll, changed } = require('../cli/fileList');
const { FileType } = require('../../models');
const scheduler = require('../infra/schedulerService');
const { isVideo } = require('../../utils');

// background watcher services
const fileLibrary = require('../helper/fileLibraryService');
const thumbnailer = require('../helper/thumbnailGenerationService');

// make it simple, scan for new files once per day
// TODO: scan for files if drive is in use 
// catalog files slowly when nobody cares

function init() {
  // fileLibrary.emitter.on(fileLibrary.events.FRESH_FILE, catalog);
}

async function catalog(filePath) {
  const fileObj = await fileLibrary.get(filePath);
  if (fileObj.type === FileType.VIDEO) {
    logger.debug(`trying to catalog ${filePath}`);
    thumbnailer.makeThumbnails(fileObj.id);
  }
}

async function catalogChanged() {
  try {
    const changedFiles = await changed(config.SHARE_PATH, 7);
    changedFiles.forEach(filePath => {
      catalog(filePath);
    });
  }
  catch(e) {
    logger.error('there was an error cataloging recent files');
    logger.error(e);
  }
}

//perhaps move this into an init and use the scheduler or something
// move this into librarian
async function catalogAll() {
  logger.info('cataloging all files');
  try {
    let allFiles = await listAll(config.SHARE_PATH);
    allFiles = allFiles.filter(filePath => (isVideo(filePath)));

    logger.info(`there are a total of ${allFiles.length} files to catalog`);

    // we can run this in a regular for loop since each generation task should use all workers anyways
    for (let i = 0; i < allFiles.length; ++i) {
      // backgroundWorker.addBackgroundTask(makeThumbnails.bind(null, fileName));
      const filePath = allFiles[i];
      await catalog(filePath);
      if (i % 100 === 0) {
        logger.info(`cataloged ${i} of ${allFiles.length} files.`);
      }
    }
    logger.info('all files have been cataloged');
  }
  catch(e) {
    logger.error('there was an issue cataloging all files');
    logger.error(e);
  }
}

const SIX_HOURS = 60 * 60 * 6 * 1000;
function startBackgroundTask() {
  scheduler.addTask('librarian bg worker', catalogChanged, SIX_HOURS);
}

// TODO: catalog all

module.exports = {
  startBackgroundTask: startBackgroundTask,
  catalogAll: catalogAll
};