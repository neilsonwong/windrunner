'use strict';

const FAVOURITES = 'fav';
const favouritesService = require('../services/videoListService').getBindingsFor(FAVOURITES);

async function favourites(ctx) {
  const favList = await favouritesService.getAll();
  ctx.body = favList;
}

async function isFavourite(ctx) {
  const folderPath = decodeURIComponent(ctx.params.folderPath);
  const result = await favouritesService.isPartOf(folderPath);
  ctx.body = { result };
}

async function addFavourite(ctx) {
  const reqBody = ctx.request.body;
  let result = false;
  if (reqBody && reqBody.folder) {
    result = await favouritesService.add(reqBody.folder);
  }
  ctx.body = { result };
}

async function removeFavourite(ctx) {
  const folderPath = decodeURIComponent(ctx.params.folderPath);
  const result = await favouritesService.remove(folderPath);
  ctx.body = { result };
}

module.exports = {
  favourites,
  addFavourite,
  removeFavourite,
  isFavourite
};
