'use strict';

const Router = require('koa-router');

const { API_VERSION } = require('../../config.json');
const { metaController, imagesController } = require('../controllers');

const API_MAJOR_VERSION = Math.floor(API_VERSION);
const API_PREFIX = `/api/v${API_MAJOR_VERSION}/`;

const adminRouter = new Router();
adminRouter.prefix(API_PREFIX);
adminRouter.get('/info', metaController.getServerInfo);
adminRouter.get('/load', metaController.getLoadStream);
adminRouter.get('/console', metaController.getConsoleStream);
adminRouter.post('/img/prune', imagesController.pruneThumbnails);

module.exports = adminRouter;
