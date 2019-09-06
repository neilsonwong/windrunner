'use strict';

const thumbnailDb = require('../data/levelDbService').instanceFor('thumbnails');

async function getThumbnailList(fileId) {
  const thumbList = await thumbnailDb.get(fileId);
  return (thumbList === undefined) ? [] : thumbList;
}

async function setThumbnailList(fileId, imgArray) {
  return await thumbnailDb.put(fileId, imgArray);
}

module.exports = {
  getThumbnailList: getThumbnailList,
  setThumbnailList: setThumbnailList,
};
