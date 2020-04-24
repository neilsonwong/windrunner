'use strict';

const favouritesService = require('../services/favouritesService');

async function favourites(ctx) {
  const favList = await favouritesService.getFavourites();
  ctx.body = favList;
}

async function isFavourite(ctx) {
  const folderPath = decodeURIComponent(ctx.params.folderPath);
  const result = await favouritesService.isFavourite(folderPath);
  ctx.body = { result };
}

async function addFavourite(ctx) {
  const reqBody = ctx.request.body;
  let result = false;
  if (reqBody && reqBody.folder) {
    result = await favouritesService.addFavourite(reqBody.folder);
  }
  ctx.body = { result };
}

async function removeFavourite(ctx) {
  const folderPath = decodeURIComponent(ctx.params.folderPath);
  const result = await favouritesService.removeFavourite(folderPath);
  ctx.body = { result };
}

module.exports = {
  favourites,
  addFavourite,
  removeFavourite,
  isFavourite
};
