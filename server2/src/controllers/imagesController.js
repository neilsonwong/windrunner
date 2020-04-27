'use strict';

const koaSend = require('koa-send');
const { THUMBNAIL_BASE, SERIES_IMAGE_BASE } = require('../../config.json');
const logger = require('../logger');

async function getThumbnail(ctx) {
  const imageId = decodeURIComponent(ctx.params.imageId);
  // thumbnails are webp
  const imageFile = `${imageId}.webp`;
  return getImage(ctx, imageFile, THUMBNAIL_BASE);
}

async function getSeriesImage(ctx) {
  const imageId = decodeURIComponent(ctx.params.imageId);
  return getImage(ctx, imageId, SERIES_IMAGE_BASE);
}

async function getImage(ctx, imageId, baseDir) {
  if (imageId) {
    try {
      return await koaSend(ctx, `${baseDir}/${imageId}`);
    }
    catch (e) {
      // this usually means the file is not found, hide the error from the user
      logger.verbose('unable to find image in static assets');
      logger.verbose(e);
    }
  }
}

module.exports = {
  getThumbnail,
  getSeriesImage
}