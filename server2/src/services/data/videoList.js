'use strict';

const videoListDbs = {};
const videoListPrefix = 'vidList';

class VideoListItem {
  constructor(folderPath) {
    this.folderPath = folderPath;
    this.created = Date.now();
  }
}

function getDbFor(listName) {
  if (videoListDbs[listName]) {
    return videoListDbs[listName];
  }

  // need a new DbInterface for this
  videoListDbs[listName] = require('./levelDbService').instanceFor(`${videoListPrefix}:${listName}`);
  return videoListDbs[listName];
}

async function get(listName) {
  const db = getDbFor(listName);
  const videoList = await db.all();
  const favs = (videoList === undefined) ?
    [] : 
    Object.keys(videoList).map((key) => {
      return videoList[key].folderPath;
    });
  return favs;
}

function set(listName, folderPath) {
  const db = getDbFor(listName);
  return db.put(folderPath, new VideoListItem(folderPath));
}

function remove(listName, folderPath) {
  const db = getDbFor(listName);
  return db.del(folderPath);
}

module.exports = {
  get,
  set,
  remove
};