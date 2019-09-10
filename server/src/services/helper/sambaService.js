'use strict';

const moment = require('moment-timezone');
const logger = require('../../logger');
const config = require('../../../config');
const { watchHistory } = require('../data');
const { samba } = require('../cli');
const scheduler = require('../infra/schedulerService');
const { sleep } = require('../../utils');

let lockHistory = {};
let mutex = true;

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
    logger.verbose('no samba files to update');
  }

  return {
    files: Object.keys(archiveThese),
    done: lockedFiles.length === 0
  };
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

async function startMonitoring() {
  let filesWithUpdatedWatchTimes = [];
  if (mutex) {
    mutex = false;
    let updatedFiles;
    while (updatedFiles = await monitorSamba(), updatedFiles.done === false) {
      await sleep(config.SMB_INTERVAL);
    }
    filesWithUpdatedWatchTimes.push(...(updatedFiles.files));
    mutex = true;
  }
  return filesWithUpdatedWatchTimes;
}

function startScheduledMonitoring() {
  if (config.SMB_DISABLE !== true) {
    scheduler.addTask('monitor Samba', monitorSamba, config.SMB_INTERVAL);
  }
}

module.exports = {
  startMonitoring: startMonitoring
};
