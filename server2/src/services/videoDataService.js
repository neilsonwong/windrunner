'use strict';

const logger = require('../logger');
const executor = require('./cli/executor');

async function getDuration(filePath) {
  const cmd = `ffprobe -v fatal -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;
  try {
    const duration = await executor.run(cmd);
    return Math.floor(duration * 1000);
  }
  catch (e) {
    logger.warn(`error getting video length for ${file}`);
    logger.warn(e);
    return -1;
  }
}

async function getVideoMetadata(filePath) {
  const duration = await getDuration(filePath);
  return {
    duration
  };
}

const isVideoRegExp = new RegExp(/(\.(avi|mkv|ogm|mp4|flv|ogg|wmv|rm|mpeg|mpg)$)/);
function isVideo(filePath) {
  return isVideoRegExp.test(filePath);
}


module.exports = {
  isVideo,
  getVideoMetadata
};
