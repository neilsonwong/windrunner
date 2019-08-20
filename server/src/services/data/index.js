'use strict';

const fileLibrary = require('./fileLibraryDbService');
const pins = require('./pinsDbService');
const watchHistory = require('./watchHistoryDbService');

module.exports = {
    fileLibrary: fileLibrary,
    pins: pins,
    watchHistory: watchHistory,
};
