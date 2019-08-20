'use strict';

const fileLibrary = require('./fileLibraryDbService');
const pins = require('./pinsDbService');
const watchHistory = require('./watchHistoryDbService');
const thumbnails = require('./thumbnailDbService');

module.exports = {
  fileLibrary: fileLibrary,
  pins: pins,
  watchHistory: watchHistory,
  thumbnails: thumbnails,
};
