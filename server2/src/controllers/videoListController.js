'use strict';

const videoListService = require('../services/videoListService');

async function getAll(ctx) {
  const listName = decodeURIComponent(ctx.params.listName);
  const list = await videoListService.getList(listName);
  ctx.body = list;
}

async function isPartOf(ctx) {
  const listName = decodeURIComponent(ctx.params.listName);
  const folderPath = decodeURIComponent(ctx.params.folderPath);
  const result = await videoListService.listContains(listName, folderPath);
  ctx.body = { result };
}

async function add(ctx) {
  const listName = decodeURIComponent(ctx.params.listName);
  const reqBody = ctx.request.body;
  let result = false;
  if (reqBody && reqBody.folder) {
    result = await videoListService.addToList(listName, reqBody.folder);
  }
  ctx.body = { result };
}

async function remove(ctx) {
  const listName = decodeURIComponent(ctx.params.listName);
  const folderPath = decodeURIComponent(ctx.params.folderPath);
  const result = await videoListService.removeFromList(listName, folderPath);
  ctx.body = { result };
}

module.exports = {
  getAll,
  add,
  remove,
  isPartOf
};
