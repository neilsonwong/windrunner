'use strict';

const fileListService = require('../services/fileListService');
const fileDetailService = require('../services/fileDetailService');
const logger = require('../logger');

async function browse(ctx) {
  const dir = (ctx.params.path === '' || ctx.params.path === undefined) ? 
    '/' : 
    decodeURIComponent(ctx.params.path);
  const files = await fileListService.listDirectory(dir);
  ctx.body = files;
}

async function recent(ctx) {
  const results = await fileListService.fastRecentChangedFolders();
  ctx.body = results;
}

async function recent2(ctx) {
  const results = await fileListService.oldRecent();
  ctx.body = results;
}

async function details(ctx) {
  const forceRefresh = ctx.query.refresh === 'plz';
  const filePath = decodeURIComponent(ctx.params.filePath);
  const details = await fileDetailService.getFileDetails(filePath, forceRefresh);
  ctx.body = details;
}


module.exports = {
  browse,
  recent,
  recent2,
  details
};
