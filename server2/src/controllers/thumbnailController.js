'use strict';

const koaSend = require('koa-send');
const { THUMBNAIL_BASE } = require('../../config.json');
const logger = require('../logger');

async function getImage(ctx) {
  const imageId = decodeURIComponent(ctx.params.imageId);
  if (imageId) {
    try {
      return await koaSend(ctx, `${THUMBNAIL_BASE}/${imageId}`);
    }
    catch (e) {
      // this usually means the file is not found, hide the error from the user
      logger.warn('unable to find image in static assets');
      logger.warn(e);
    }
  }
}

module.exports = {
  getImage
}