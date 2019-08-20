'use strict';

const winston = require('../../logger');
const executor = require('./executor');

async function duration(file){
  const cmd = `ffprobe -v fatal -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${file}"`;
  try {
    const duration = await executor.run(cmd);
    return Math.floor(duration);
  }
  catch (e) {
    winston.warn(`error getting video length for ${file}`);
    winston.warn(e);
    return -1;
  }
}

module.exports = {
  duration: duration
};
