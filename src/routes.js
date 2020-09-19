'use strict';

const Router = require('koa-router');

const { API_VERSION } = require('../config.json');
const listingController = require('./controllers/listingController');
const favouritesController = require('./controllers/favouritesController');
const imagesController = require('./controllers/imagesController');
const metaController = require('./controllers/metaController');
const waitingController = require('./controllers/waitingController');
const seriesDataController = require('./controllers/seriesDataController');
const videoListController = require('./controllers/videoListController');

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

publicRouter.get('/favs', favouritesController.favourites);
publicRouter.post('/fav', favouritesController.addFavourite);
publicRouter.del('/fav/:folderPath', favouritesController.removeFavourite);
publicRouter.get('/fav/:folderPath', favouritesController.isFavourite);

publicRouter.get('/vlist/:listName', videoListController.getAll);
publicRouter.post('/vlist/:listName', videoListController.add);
publicRouter.del('/vlist/:listName/:folderPath', videoListController.remove);
publicRouter.get('/vlist/:listName/:folderPath', videoListController.isPartOf);

publicRouter.get('/img/thumbs/:imageId', imagesController.getThumbnail);
publicRouter.get('/img/series/:imageId', imagesController.getSeriesImage);
publicRouter.post('/img/prune', imagesController.pruneThumbnails);

publicRouter.get('/resource/:id', waitingController.getStatus);

publicRouter.get('/series/options/:folderPath', seriesDataController.listSeriesOptions);
publicRouter.put('/series', seriesDataController.updateSeriesOption);

const adminRouter = new Router();
adminRouter.prefix(API_PREFIX);
adminRouter.get('/info', metaController.getServerInfo);
adminRouter.get('/load', metaController.getLoadStream);
adminRouter.get('/console', metaController.getConsoleStream);

module.exports = {
  publicRouter: publicRouter,
  // user,
  adminRouter: adminRouter,
};
