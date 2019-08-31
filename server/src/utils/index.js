'use strict';

const FILETYPE = require('../models/FileType');

function sleep(ms) {
  return new Promise(r => setTimeout(r,ms));
}

const isVideoRegExp = new RegExp(/(\.(avi|mkv|ogm|mp4|flv|ogg|wmv|rm|mpeg|mpg)$)/);
function isVideo(filePath) {
  return isVideoRegExp.test(filePath);
}

function getFileType(file, stats) {
  if (stats === null || stats === undefined) {
    return FILETYPE.INVALID;
  }
  else if (stats.isDirectory()) {
    return FILETYPE.DIRECTORY;
  }
  else if (isVideo(file)) {
    return FILETYPE.VIDEO;
  }
  return FILETYPE.FILE;
}

module.exports = {
  isVideo: isVideo,
  sleep: sleep,
  getFileType: getFileType,
};
