'use strict';

const videoListService = require('./data/videoList');
const fileDetailService = require('./fileDetailService');
const fileUtil = require('../utils/fileUtil');

async function getList(listName, user) {
  const folders = await videoListService.get(listName, user);
  return Promise.all(folders.map(folderPath => {
    return fileDetailService.getFileDetails(folderPath);
  }));
}

function addToList(listName, user, folderPath) {
  const cleaned = fileUtil.cleanDirPath(folderPath);
  const fullPath = fileUtil.pathOnServer(cleaned);
  return videoListService.set(listName, user, fullPath);
}

function removeFromList(listName, user, folderPath) {
  const cleaned = fileUtil.cleanDirPath(folderPath);
  const fullPath = fileUtil.pathOnServer(cleaned);
  return videoListService.remove(listName, user, fullPath);
}

async function listContains(listName, user, folderPath) {
  const cleaned = fileUtil.cleanDirPath(folderPath);
  const fullPath = fileUtil.pathOnServer(cleaned);
  const folders = await videoListService.get(listName, user);
  return (folders.indexOf(fullPath) !== -1);
}

// deprecated
// kept here for legacy maintenance purposes
// function getBindingsFor(listName) {
//   return {
//     getAll: getList.bind(null, listName),
//     add: addToList.bind(null, listName),
//     remove: removeFromList.bind(null, listName),
//     isPartOf: listContains.bind(null, listName),
//   };
// }

module.exports = {
  getList,
  addToList,
  removeFromList,
  listContains
};