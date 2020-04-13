'use strict';

const favourites = require('./data/favourites');
const fileDetailService = require('./fileDetailService');
const fileUtil = require('../utils/fileUtil');

async function getFavourites() {
  const folders = await favourites.get();
  return Promise.all(folders.map(folderPath => {
    return fileDetailService.getFileDetails(folderPath);
  }));
}

function addFavourite(folderPath) {
  const cleaned = fileUtil.cleanDirPath(folderPath);
  return favourites.set(cleaned);
}

function removeFavourite(folderPath) {
  const cleaned = fileUtil.cleanDirPath(folderPath);
  return favourites.remove(cleaned);
}

module.exports = {
  getFavourites,
  addFavourite,
  removeFavourite
};