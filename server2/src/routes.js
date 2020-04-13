'use strict';

const Router = require('koa-router');

const { API_VERSION } = require('../config.json');
const listingController = require('./controllers/listingController');
const favouritesController = require('./controllers/favouritesController');
const thumbnailController = require('./controllers/thumbnailController');
const metaController = require('./controllers/metaController');

const API_PREFIX = `/api/v${API_VERSION}/`;

const router = new Router();
router.prefix(API_PREFIX);

router.get('/hello', metaController.hello);
router.get('/info', metaController.getServerInfo);

router.get('/browse', listingController.browse);
router.get('/browse/:path', listingController.browse);
router.get('/details/:filePath', listingController.details);
router.get('/recent', listingController.recent);
router.get('/recent2', listingController.recent2);

router.get('/favs', favouritesController.favourites);
router.post('/fav', favouritesController.addFavourite);
router.del('/fav', favouritesController.removeFavourite);

router.get('/img/:imageId', thumbnailController.getImage);

module.exports = router;
