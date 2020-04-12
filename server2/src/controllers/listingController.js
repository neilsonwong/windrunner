'use strict';

const fileListService = require('../services/fileListService');

async function browse(ctx) {
  const dir = ctx.params.path === '' ? '/' : decodeURIComponent(ctx.params.path);
  const files = await fileListService.listDirectory(dir);
  ctx.body = files;
}

module.exports = {
  browse
};
