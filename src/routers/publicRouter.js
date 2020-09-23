'use strict';

const Router = require('koa-router');

const { API_VERSION } = require('../../config.json');
const {
  listingController, 
  imagesController, 
  metaController, 
  waitingController, 
  seriesDataController, 
  streamingController
} = require('../controllers');

const API_MAJOR_VERSION = Math.floor(API_VERSION);
const API_PREFIX = `/api/v${API_MAJOR_VERSION}/`;

const publicRouter = new Router();
publicRouter.prefix(API_PREFIX);

publicRouter.get('/hello', metaController.hello);

publicRouter.get('/browse', listingController.browse);
publicRouter.get('/browse/:path', listingController.browse);
publicRouter.get('/details/:filePath', listingController.details);
publicRouter.get('/recent', listingController.recent);
publicRouter.get('/recent/:folderPath', listingController.recentlyChanged);

publicRouter.get('/img/thumbs/:imageId', imagesController.getThumbnail);
publicRouter.get('/img/series/:imageId', imagesController.getSeriesImage);

publicRouter.get('/resource/:id', waitingController.getStatus);

publicRouter.get('/series/options/:folderPath', seriesDataController.listSeriesOptions);
publicRouter.put('/series', seriesDataController.updateSeriesOption);

publicRouter.get('/vidTest', streamingController.testPage);
publicRouter.get('/stream', streamingController.testStream);
publicRouter.get('/subtitle', streamingController.testSub);
publicRouter.get('/subtitle/:fileId', streamingController.getSubtitle);
publicRouter.get('/stream/:fileId', streamingController.getStream);

module.exports = publicRouter;
