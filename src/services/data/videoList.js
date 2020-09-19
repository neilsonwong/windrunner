'use strict';

const videoListDbs = {};
const videoListPrefix = 'vidList';

class VideoListItem {
  constructor(folderPath) {
    this.folderPath = folderPath;
    this.created = Date.now();
  }
}

function getDbFor(listName, user) {
  const key = `${listName}:${user}`;
  if (videoListDbs[key]) {
    return videoListDbs[key];
  }

  // need a new DbInterface for this
  videoListDbs[key] = require('./levelDbService').instanceFor(`${videoListPrefix}:${key}`);
  return videoListDbs[key];
}

async function get(listName, user) {
  const db = getDbFor(listName, user);
  const videoList = await db.all();
  const favs = (videoList === undefined) ?
    [] : 
    Object.keys(videoList).map((key) => {
      return videoList[key].folderPath;
    });
  return favs;
}

function set(listName, user, folderPath) {
  const db = getDbFor(listName, user);
  return db.put(folderPath, new VideoListItem(folderPath));
}

function remove(listName, user, folderPath) {
  const db = getDbFor(listName, user);
  return db.del(folderPath);
}

module.exports = {
  get,
  set,
  remove
};