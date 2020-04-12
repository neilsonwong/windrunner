'use strict';

const Router = require('koa-router');

const { API_VERSION } = require('../config.json');
const listingController = require('./controllers/listingController');
const metaController = require('./controllers/metaController');

const API_PREFIX = `/api/v${API_VERSION}/`;

const router = new Router();
router.prefix(API_PREFIX);

router.get('/hello', metaController.hello);
router.get('/info', metaController.getServerInfo);

router.get('/browse/:path', listingController.browse);
router.get('/details/:filePath', listingController.details);

module.exports = router;
