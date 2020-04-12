'use strict';

const fileListService = require('../services/fileListService');
const fileDetailService = require('../services/fileDetailService');

async function browse(ctx) {
  const dir = ctx.params.path === '' ? '/' : decodeURIComponent(ctx.params.path);
  const files = await fileListService.listDirectory(dir);
  ctx.body = files;
}

async function recent(ctx) {

}

async function favourites(ctx) {

}

async function details(ctx) {
  const filePath = decodeURIComponent(ctx.params.filePath);
  const details = await fileDetailService.getFileDetails(filePath);
  ctx.body = details;
}

module.exports = {
  browse,
  recent,
  favourites,
  details
};
