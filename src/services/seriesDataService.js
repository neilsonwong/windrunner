'use strict';

const aniListService = require('./dataGatherers/aniListService');
const fileDetailService = require('./fileDetailService');

async function listSeriesOptions(folderPath) {
  // fileDetailService will handle rel -> path on server
  // should be a fast call as it should be cached already
  const dirFile = await fileDetailService.getFileDetails(folderPath);
  const results = await aniListService.searchForSeries(dirFile.name);
  return results;
}

async function updateSeriesOption(folderPath, aniListId) {
  const dirFile = await fileDetailService.getFileDetails(folderPath);
  const aniListData = await aniListService.getAniListData(aniListId);
  const updatedSeries = await fileDetailService.addAniListDataToDir(aniListData, dirFile, null);
  return updatedSeries; 
}

module.exports = {
  listSeriesOptions,
  updateSeriesOption
};
