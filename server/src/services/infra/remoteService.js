'use strict';

const config = require('../../../config');
const logger = require('../../logger');
const { isMounted, mountRemoteSamba } = require('../cli/mount');

async function init() {
  if (config.REMOTE_HOST) {
    const alreadyMounted = await isMounted();
    if (!alreadyMounted) {
      await mountRemoteSamba();
    }
    else {
      logger.info(`${config.REMOTE_SHARE_PATH} is already mounted at ${config.SHARE_PATH}`);
    }
  }
}

module.exports = {
  init: init
};