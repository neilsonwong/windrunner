'use strict';

const fs = require('fs').promises;
const { exec } = require('child_process');
const config = require('../../../config');
const logger = require('../../logger');

async function mountRemoteSamba() {
  try {
    // make the folder if it's not there
    await fs.mkdir(config.SHARE_PATH, {recursive: true});

    // mount the remote samba drive
    const cmd = `mount -t drvfs '${config.REMOTE_SHARE_PATH}' ${config.SHARE_PATH}`;
    await new Promise((res, rej) => {
      exec(cmd, (err, stdout, stderr) => {
        if (err !== null) {
          rej(err);
        }
        else if (stderr){
          rej(stderr);
        }
        else {
          logger.info(`mounted ${config.REMOTE_SHARE_PATH} at ${config.SHARE_PATH}`);
          res(stdout);
        }
      });
    });
  }
  catch (e) {
    logger.error(`error mounting ${config.REMOTE_SHARE_PATH} at ${config.SHARE_PATH}`);
    logger.error(e);
  }
}

module.exports = {
  mountRemoteSamba: mountRemoteSamba
};
