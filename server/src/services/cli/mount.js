'use strict';

const fs = require('fs').promises;
const { exec, spawn } = require('child_process');
const config = require('../../../config');
const logger = require('../../logger');

function spawn2() {
  var result = spawn.apply(this, arguments);
  return result;
}

async function mountRemoteSamba() {
  try {
    // make the folder if it's not there
    await fs.mkdir(config.SHARE_PATH, {recursive: true});

    // mount the remote samba drive
    const cmd = ['mount', '--verbose', '-t', 'drvfs', `${config.REMOTE_SHARE_PATH}`,  `${config.SHARE_PATH}`/* '/home/neilson/honoka'*/ ];
    await new Promise((res, rej) => {
      const child = spawn('sudo', 
        ['-S', '-k', '-p', 'password prompt'].concat(cmd), 
        {stdio: 'pipe'});
      child.stdin.setDefaultEncoding('utf-8');

      // apparently sudo likes to pipe from stderr!
      child.stderr.on('data', (data) => {
        const lines = data.toString();
        if (lines.indexOf('password prompt') !== -1) {
          // i think it's asking for sudo password
          child.stdin.write(`${config.SUDO_PW}\n`);
          child.stdin.end();
          logger.info('we sent in the pw houston');
        }
      });

      child.on('error', (e) => {
        rej(e);
      });

      child.on('close', (code) => {
        if (code === 0) {
          logger.info(`mounted ${config.REMOTE_SHARE_PATH} at ${config.SHARE_PATH}`);
          res();
        }
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
