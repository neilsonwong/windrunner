'use strict';

const logger = require('../../logger');
const config = require('../../../config');
const executor = require('./executor');

async function search(q) {
  const cmd = 'find';
  const args = [config.SHARE_PATH, '-iname', `*${q}*`];
  try {
    const results = await executor.run(cmd, args);
    if (results) {
      return results.split('\n')
        .filter(e => (e.length > 0));
    }
  }
  catch (e) {
    logger.warn(`error occurred when running search for ${q}`);
    logger.warn(e);
  }
  return [];
}

async function streamSearch(q) {
  const cmd = 'find';
  const args = [config.SHARE_PATH, '-iname', `*${q}*`];
  try {
    const spawned = await executor.run(cmd, args, { stream: true });
    return spawned;
  }
  catch (e) {
    logger.warn(`error occurred when running streamed search for ${q}`);
    logger.warn(e);
  }
}

async function list(d) {
  const cmd = `ls -d "${d}"/*`;
  try {
    const results = await executor.run(cmd);
    if (results) {
      return results.split('\n')
        .filter(e => (e.length > 0));
    }
  }
  catch (e) {
    logger.warn(`error occurred when running search for ${d}`);
    logger.warn(e);
  }
  return [];
}

async function fullListing(folder) {
  try {
    const allFiles = await executor.run('find',
      [folder, '-not', '-path', `'*/.*'`, '-type', 'f']);
    return allFiles.split('\n')
      .filter(e => (e.length > 0));
  }
  catch(e) {
    logger.warn(`there was an error full Listing ${folder}`);
    logger.warn(e);
    return []; 
  }
}

async function slowChanged(folder, days) {
  try {
    const changed = await executor.run('find',
      [folder, '-maxdepth', '3', '-not', '-path', `'*/.*'`, '-type', 'f', '-mtime', `-${days}`]);
    return changed.split('\n')
      .filter(e => (e.length > 0));
  }
  catch(e) {
    logger.warn(`there was an error finding changed files in ${folder}`);
    logger.warn(e);
    return [];
  }
}

async function changed(folder, days, depth) {
  if (!depth) {
    depth = 0;
  }

  try {
    let allChanges = [];
    const rootDirMaxDepth = depth === 0 ? '2' : '1';

    const changedFiles = await executor.run('find',
      [folder, '-mindepth', '1', '-maxdepth', '1', 
      '-not', '-path', `'*/.*'`, 
      '-type', 'f', 
      '-mtime', `-${days}`]);

    const changedDirString = await executor.run('find',
      [folder, '-mindepth', '1', '-maxdepth', rootDirMaxDepth,
      '-not', '-path', `'*/.*'`, 
      '-type', 'd', 
      '-mtime', `-${days}`]);

    const changedDirs = changedDirString.split('\n')
      .filter(e => (e.length > 0));

    allChanges.push(...(changedFiles.split('\n')
      .filter(e => (e.length > 0))));

    const subChanges = await Promise.all(changedDirs.map(e => changed(e, days, depth + 1)));
    for (let change of subChanges) {
      allChanges.push(...change);
    }

    return allChanges;
  }
  catch(e) {
    logger.warn(`there was an error finding changed files in ${folder}`);
    logger.warn(e);
    return [];
  }
}

module.exports = {
  search: search,
  list: list,
  listAll: fullListing,
  changed: changed,
  streamSearch, streamSearch
};
