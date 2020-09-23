'use strict';

const Router = require('koa-router');

const { API_VERSION } = require('../../config.json');
const { videoListController } = require('../controllers');

const API_MAJOR_VERSION = Math.floor(API_VERSION);
const API_PREFIX = `/api/v${API_MAJOR_VERSION}/`;

const userRouter = new Router();
userRouter.prefix(API_PREFIX);
userRouter.post('/vlist/:listName', videoListController.add);
userRouter.del('/vlist/:listName/:folderPath', videoListController.remove);

module.exports = userRouter;
