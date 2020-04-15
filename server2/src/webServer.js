'use strict';

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');

const { API_PORT, API_VERSION } = require('../config.json');

const logger = require('./logger');
const router = require('./routes');

const app = new Koa();

// middlewares
app.use(cors());
app.use(bodyParser({
  enableTypes: ['json'],
  jsonLimit: '10mb'
}));

// routes
app
  .use(router.routes())
  .use(router.allowedMethods());

function start() {
  app.listen(9876);
  logger.info(`Windrunner API server (ver ${API_VERSION}) started on port ${API_PORT}`);
}

module.exports = {
  start
};
