'use strict';

const seriesDataService = require('../services/seriesDataService');

async function listSeriesOptions(ctx) {
  const folderPath = decodeURIComponent(ctx.params.folderPath);
  const results = await seriesDataService.listSeriesOptions(folderPath);
  ctx.body = { results };
}

async function updateSeriesOption(ctx) {
  const reqBody = ctx.request.body;
  let result = null;
  if (reqBody && reqBody.folder && reqBody.aniListId) {
    result = await seriesDataService.updateSeriesOption(reqBody.folder, reqBody.aniListId);
  }
  ctx.body = result;
}

module.exports = {
  listSeriesOptions,
  updateSeriesOption
}