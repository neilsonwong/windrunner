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
  const fullPath = fileUtil.pathOnServer(cleaned);
  return favourites.set(fullPath);
}

function removeFavourite(folderPath) {
  const cleaned = fileUtil.cleanDirPath(folderPath);
  const fullPath = fileUtil.pathOnServer(cleaned);
  return favourites.remove(fullPath);
}

async function isFavourite(folderPath) {
  const cleaned = fileUtil.cleanDirPath(folderPath);
  const fullPath = fileUtil.pathOnServer(cleaned);
  const folders = await favourites.get();
  return (folders.indexOf(fullPath) !== -1);
}

module.exports = {
  getFavourites,
  addFavourite,
  removeFavourite,
  isFavourite
};