'use strict';

const fs = require('fs').promises;
const path = require('path');

const { SHARE_PATH } = require('../../config.json');
const logger = require('../logger');
const fileDetailService = require('./fileDetailService');
const fileUtil = require('../utils/fileUtil');
const executor = require('./cli/executor');

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

async function recentChangedFolders() {
  const days = 7;
  const folder = SHARE_PATH;

  try {
    const changedDirString = await executor.runImmediately(
      'find',
      [folder, '-mindepth', '1', '-maxdepth', '2',
        '-not', '-path', `'*/.*'`,
        '-type', 'd',
        '-mtime', `-${days}`]);

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

function oldRecent() {
  return recentlyChangedInFolder(SHARE_PATH, 7);
}

async function filesChangedInFolder(folder) {
  const days = 7;

  const changedFiles = await executor.runImmediately(
    'find',
    [folder, '-mindepth', '1', '-maxdepth', '1',
      '-not', '-path', `'*/.*'`,
      '-type', 'f',
      '-mtime', `-${days}`]);
  const changed = changedFiles
    .split('\n').filter(e => (e.length > 0))
    .map(file => (fileUtil.getPathRelativeToRoot(file)));
  return changed;
}

async function recentlyChangedInFolder(folder, days, depth) {
  if (!depth) {
    depth = 0;
  }

  try {
    let allChanges = [];
    const rootDirMaxDepth = depth === 0 ? '2' : '1';

    const changedFiles = await executor.runImmediately(
      'find',
      [folder, '-mindepth', '1', '-maxdepth', '1',
        '-not', '-path', `'*/.*'`,
        '-type', 'f',
        '-mtime', `-${days}`]);

    const changedDirString = await executor.runImmediately(
      'find',
      [folder, '-mindepth', '1', '-maxdepth', rootDirMaxDepth,
        '-not', '-path', `'*/.*'`,
        '-type', 'd',
        '-mtime', `-${days}`]);

    const changedDirs = changedDirString.split('\n')
      .filter(e => (e.length > 0));

    allChanges.push(...(changedFiles.split('\n')
      .filter(e => (e.length > 0))));

    const subChanges = await Promise.all(changedDirs.map(e => recentlyChangedInFolder(e, days, depth + 1)));
    for (let change of subChanges) {
      allChanges.push(...change);
    }

    return allChanges;
  }
  catch (e) {
    logger.warn(`there was an error finding changed files in ${folder}`);
    logger.warn(e);
    return [];
  }
}

module.exports = {
  listDirectory,
  recentChangedFolders,
  oldRecent
};
