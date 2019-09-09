'use strict';

const fileLibrary = require('../helper/fileLibraryService');
const watchHistory = require('../data/watchHistoryDbService');
const pinDb = require('../data/pinsDbService');

async function getPinned() {
  const pinList = await pinDb.getPinned();
  const files = await fileLibrary.get(pinList);
  return files;
}

async function isPinned(folder) {
  return await pinDb.isPinned(folder);
}

async function addPin(pin) {
  return await pinDb.addPin(pin);
}

async function delPin(pin) {
  return await pinDb.delPin(pin);
}

async function getWatchTime(file) {
  return await watchHistory.getWatchTime(file);
}

async function updateWatchTime(file, time) {
  return await watchHistory.addWatchTime(file, time);
}

async function resetWatchTime(file) {
  return await watchHistory.resetWatchTime(file);
}

module.exports = {
  getPinned: getPinned,
  isPinned: isPinned,
  addPin: addPin,
  delPin: delPin,
  getWatchTime: getWatchTime,
  updateWatchTime: updateWatchTime,
  resetWatchTime: resetWatchTime,
};
