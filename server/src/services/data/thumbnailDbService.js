'use strict';

const thumbnailDb = require('../data/levelDbService').instanceFor('thumbnails');

async function getThumbnailList(fileName) {
  const thumbList = await thumbnailDb.get(fileName);
  return (thumbList === undefined) ? [] : thumbList;
}

async function setThumbnailList(fileName, imgArray) {
  await thumbnailDb.put(fileName, imgArray);
}

module.exports = {
  getThumbnailList: getThumbnailList,
  setThumbnailList: setThumbnailList,
};
