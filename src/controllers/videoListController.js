'use strict';

const config = require('../../config.json');
const videoListService = require('../services/videoListService');

async function getAll(ctx) {
  const user = ctx.state.user || config.ADMINS[0];
  const listName = decodeURIComponent(ctx.params.listName);
  const list = await videoListService.getList(listName, user);
  ctx.body = list;
}

async function isPartOf(ctx) {
  const user = ctx.state.user;
  const listName = decodeURIComponent(ctx.params.listName);
  const folderPath = decodeURIComponent(ctx.params.folderPath);
  const result = await videoListService.listContains(listName, user, folderPath);
  ctx.body = { result };
}

async function add(ctx) {
  const user = ctx.state.user;
  const listName = decodeURIComponent(ctx.params.listName);
  const reqBody = ctx.request.body;
  let result = false;
  if (reqBody && reqBody.folder) {
    result = await videoListService.addToList(listName, user, reqBody.folder);
  }
  ctx.body = { result };
}

async function remove(ctx) {
  const user = ctx.state.user;
  const listName = decodeURIComponent(ctx.params.listName);
  const folderPath = decodeURIComponent(ctx.params.folderPath);
  const result = await videoListService.removeFromList(listName, user, folderPath);
  ctx.body = { result };
}

module.exports = {
  getAll,
  add,
  remove,
  isPartOf
};
