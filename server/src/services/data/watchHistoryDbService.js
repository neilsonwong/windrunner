'use strict';

const watchHistory = require('./levelDbService').instanceFor('watchHistory');

async function getWatchTime(file) {
  const time = await watchHistory.get(file);
  return time === undefined ? 0 : time;
}

async function addWatchTime(file, time) {
  const current = await getWatchTime(file);
  return await watchHistory.put(file, current + time);
}

async function resetWatchTime(file) {
  return await watchHistory.del(file);
}

async function setWatchTime(file, time) {
  return await watchHistory.put(file, time);
}

module.exports = {
  getWatchTime: getWatchTime,
  addWatchTime: addWatchTime,
  resetWatchTime: resetWatchTime,
  setWatchTime: setWatchTime,
};

/*
async function testWatchHistory() {
  await watchHistory.del('testFile');
  let watched = await getWatchTime('testFile');
  await updateWatchTime('testFile', 2);
  let watched2 = await getWatchTime('testFile');
}
*/