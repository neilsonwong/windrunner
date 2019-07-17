'use strict';

const FileCache = require('./fileCache');

function getWatchTime(file) {
  let watchTimeCache = FileCache.get("watchTime");
  if (watchTimeCache[file]) {
    return watchTimeCache[file];
  }
  return 0;
}

async function addTime(file, time) {
  let watchTimeCache = FileCache.get("watchTime");
  if (watchTimeCache[file]) {
    watchTimeCache[file] += time;
  }
  else {
    watchTimeCache[file] = time;
  }
  await FileCache.set("watchTime", watchTimeCache);
}

async function delTime(file) {
  let watchTimeCache = FileCache.get("watchTime");
  if (watchTimeCache[file]) {
    watchTimeCache[file] = 0;
    await FileCache.set("watchTime", watchTimeCache);
  }
  else {
    console.log(`the file ${file} does not exist in watch time`);
  }
}

async function init(){
  await FileCache.loadCache("watchTime");
}

init();

module.exports = {
  get: getWatchTime,
  addTime: addTime,
  delTime: delTime,
};
