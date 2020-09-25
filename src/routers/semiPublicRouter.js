'use strict';

const Router = require('koa-router');

const { API_VERSION } = require('../../config.json');
const { videoListController } = require('../controllers');

const API_MAJOR_VERSION = Math.floor(API_VERSION);
const API_PREFIX = `/api/v${API_MAJOR_VERSION}/`;

const semiPublicRouter = new Router();
semiPublicRouter.prefix(API_PREFIX);
semiPublicRouter.get('/vlist/:listName', videoListController.getAll);
semiPublicRouter.get('/vlist/:listName/:folderPath', videoListController.isPartOf);

module.exports = semiPublicRouter;
