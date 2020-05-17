'use strict';

const path = require('path');
const logger = require('../../logger');
const { ANI_LIST_RESTORE_FILE } = require('../../../config.json');

const rootDir = path.dirname(require.main.filename);

function getRestoreMappings() {
  try {
    const cache = {};
    const raw = require(path.join(rootDir, ANI_LIST_RESTORE_FILE));
    raw.forEach(entry => {
      if (entry && entry.aniListData && !entry.aniListData.nextAiringEpisode) {
        cache[entry.name] = entry.aniListData;
      }
      else {
        // console.log('not restoring ' + entry.name);
      }
    });
    logger.info('Ani Restore File Loaded');
    return cache;
  }
  catch (e) {
    logger.warn('unable to restore from backed up cache');
    logger.warn(e);
  }
}

module.exports = {
  getRestoreMappings
};
