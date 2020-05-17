'use strict';

const videoListService = require('./data/videoList');
const fileDetailService = require('./fileDetailService');
const fileUtil = require('../utils/fileUtil');

async function getList(listName) {
  const folders = await videoListService.get(listName);
  return Promise.all(folders.map(folderPath => {
    return fileDetailService.getFileDetails(folderPath);
  }));
}

function addToList(listName, folderPath) {
  const cleaned = fileUtil.cleanDirPath(folderPath);
  const fullPath = fileUtil.pathOnServer(cleaned);
  return videoListService.set(listName, fullPath);
}

function removeFromList(listName, folderPath) {
  const cleaned = fileUtil.cleanDirPath(folderPath);
  const fullPath = fileUtil.pathOnServer(cleaned);
  return videoListService.remove(listName, fullPath);
}

async function listContains(listName, folderPath) {
  const cleaned = fileUtil.cleanDirPath(folderPath);
  const fullPath = fileUtil.pathOnServer(cleaned);
  const folders = await videoListService.get(listName);
  return (folders.indexOf(fullPath) !== -1);
}

function getBindingsFor(listName) {
  return {
    getAll: getList.bind(null, listName),
    add: addToList.bind(null, listName),
    remove: removeFromList.bind(null, listName),
    isPartOf: listContains.bind(null, listName),
  };
}

module.exports = {
  getList,
  addToList,
  removeFromList,
  listContains,
  getBindingsFor,
};