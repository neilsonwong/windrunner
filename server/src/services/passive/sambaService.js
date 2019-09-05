'use strict';

const moment = require('moment-timezone');
const logger = require('../../logger');
const config = require('../../../config');
const { watchHistory } = require('../data');
const { samba } = require('../cli');
const scheduler = require('../infra/schedulerService');

let lockHistory = {};

async function monitorSamba() {
  // get locked files
  logger.verbose('checking samba for locked files');
  const lockedFiles = await samba.lockedFiles();
  const archiveThese = diffLockHistories(lockHistory, lockedFiles);
  lockHistory = lockedFiles;
  if (Object.entries(archiveThese).length !== 0 && archiveThese.constructor === Object) {
    const updatePromises = [];

    for (let file in archiveThese) {
      const timeDiff = moment().valueOf() - archiveThese[file];

      // update the watch time on these
      updatePromises.push(watchHistory.addWatchTime(file, timeDiff));
    }

    logger.verbose(`updating watch times for ${Object.keys(archiveThese)}`);
    await Promise.all(updatePromises);
  }
  else {
    // TODO: lower the logging level
    logger.verbose('no samba files to update');
  }
}

function diffLockHistories(oldHistory, newHistory) {
  const archiveThese = {};
  for (let i = 0; i < oldHistory.length; ++i) {
    archiveThese[oldHistory[i].path] = oldHistory[i].time;
  }
  for (let j = 0; j < newHistory.length; ++j) {
    if (archiveThese[newHistory[j].path] !== undefined) {
      delete archiveThese[newHistory[j].path];
    }
  }
  return archiveThese;
}

function startMonitoring() {
  if (config.SMB_DISABLE !== true) {
    scheduler.addTask('monitor Samba', monitorSamba, config.SMB_INTERVAL);
  }
}

module.exports = {
  startMonitoring: startMonitoring
};
