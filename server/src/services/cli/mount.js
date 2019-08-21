'use strict';

const fs = require('fs').promises;
const { exec, spawn } = require('child_process');
const config = require('../../../config');
const logger = require('../../logger');

async function mountRemoteSamba() {
  try {
    // make the folder if it's not there
    await fs.mkdir(config.SHARE_PATH, {recursive: true});

    // mount the remote samba drive
    const cmd = `sudo mount -t drvfs '${config.REMOTE_SHARE_PATH}' ${config.SHARE_PATH}`;
    await new Promise((res, rej) => {
      const child = spawn(cmd);
      child.stdin.setDefaultEncoding('utf-8');
      child.stdout.on('data', (data) => {
        if (data.indexOf('password') > 0) {
          // i think it's asking for sudo password
          child.stdin.write(`${config.SUDO_PW}\n`);
          child.stdin.end();
          logger.info('we sent in the pw houston');
        }
      });

      child.on('error', (e) => {
        rej(e);
      });

      child.on('close', () => {
        logger.info(`mounted ${config.REMOTE_SHARE_PATH} at ${config.SHARE_PATH}`);
        res();
      });

        
    });
  }
  catch (e) {
    logger.error(`error mounting ${config.REMOTE_SHARE_PATH} at ${config.SHARE_PATH}`);
    logger.error(e);
  }
}

async function isMounted() {
  try {
    const cmd = `mount`;
    return await new Promise((res, rej) => {
      exec(cmd, (err, stdout, stderr) => {
        if (err !== null) {
          rej(err);
        }
        else if (stderr){
          rej(stderr);
        }
        else {
          res(stdout.indexOf(config.REMOTE_SHARE_PATH) !== -1 &&
            stdout.indexOf(config.SHARE_PATH) !== -1);
        }
      });
    });
  }
  catch (e) {
    logger.error(`error checking what is mounted`);
    logger.error(e);
  }
}

module.exports = {
  mountRemoteSamba: mountRemoteSamba,
  isMounted: isMounted
};
