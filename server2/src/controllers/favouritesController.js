'use strict';

const favouritesService = require('../services/favouritesService');

async function favourites(ctx) {
  const favList = await favouritesService.getFavourites();
  ctx.body = favList;
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
  const reqBody = ctx.request.body;
  let result = false;
  if (reqBody && reqBody.folder) {
    result = await favouritesService.removeFavourite(reqBody.folder);
  }
  ctx.body = { result };
}

module.exports = {
  favourites,
  addFavourite,
  removeFavourite
};
