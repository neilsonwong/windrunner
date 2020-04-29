'use strict';

const fs = require('fs').promises;
const path = require('path');

const { SHARE_PATH } = require('../../config.json');
const logger = require('../logger');
const fileDetailService = require('./fileDetailService');
const fileUtil = require('../utils/fileUtil');
const executor = require('./cli/executor');
const pendingResourceService = require('./pendingResourceService');

let cached = null;

async function listDirectory(dir) {
  if (!dir) {
    logger.error('attempt to list empty or null directory');
    return [];
  }

  try {
    const pathOnServer = fileUtil.pathOnServer(dir);
    const files = await fs.readdir(pathOnServer);
    if (files && files.length > 0) {
      return Promise.all(files
        .filter(fileName => (fileName.length > 0))
        .filter(item => !(/(^|\/)\.[^/.]/g.test(item)))
        .map(file => {
          const filePath = path.join(pathOnServer, file);
          return fileDetailService.getFastFileDetails(filePath);
        }));
    }
    else {
      logger.verbose(`empty directory: ${dir}`);
    }
  }
  catch (e) {
    logger.error('error occurred when listing directory');
    logger.error(e);
  }
  return [];
}

async function fastRecentChangedFolders() {
  // doesn't change that much, so we can use the cached one for instant results
  if (cached) {
    const promised = recentChangedFolders();
    const promisedId = pendingResourceService.add(promised);
    return {
      changed: cached,
      promised: promisedId
    };
  }

  // update the cache
  cached = await recentChangedFolders();
  return {
    changed: cached
  };
}

async function recentChangedFolders() {
  const days = 7;
  const folder = SHARE_PATH;

  try {
    const changedDirString = await executor.runImmediately(
      'find',
      [`'${folder}'`, '-mindepth', '1', '-maxdepth', '2',
        '-not', '-path', `'*/.*'`,
        '-type', 'd',
        '-mtime', `-${days}`],
        { shell: true });

    const changedDirs = await Promise.all(
      changedDirString
        .split('\n')
        .filter(e => (e.length > 0))
        .map(dir => fileDetailService.getFileDetails(dir)));

    const series = await Promise.all(changedDirs
      .filter(dir => (dir.isSeriesLeafNode))
      .map(async (dir) => {
        const changed = await filesChangedInFolder(dir.filePath);
        dir.newFiles = changed;
        return dir;
      }));
    return series.filter(dir => (dir.newFiles && dir.newFiles.length > 0));
  }
  catch (e) {
    logger.warn(`there was an error finding recently changed folders in ${folder}`);
    logger.warn(e);
    return [];
  }
}

async function recentlyChangedinFolder(folder) {
  const fullPath = fileUtil.pathOnServer(folder);
  const changed = await filesChangedInFolder(fullPath, 14);
  const details = await Promise.all(
    changed.map(dir => fileDetailService.getFileDetails(dir)));
  return details;
}

async function filesChangedInFolder(folder, days) {
  if (!days) {
    days = 7
  }

  const changedFiles = await executor.runImmediately(
    'find',
    [`'${folder}'`, '-mindepth', '1', '-maxdepth', '1',
      '-not', '-path', `'*/.*'`,
      '-type', 'f',
      '-mtime', `-${days}`],
      { shell: true });
  const changed = changedFiles
    .split('\n').filter(e => (e.length > 0))
    .map(file => (fileUtil.getPathRelativeToRoot(file)));
  return changed;
}

module.exports = {
  listDirectory,
  fastRecentChangedFolders,
  recentChangedFolders,
  recentlyChangedinFolder
};
