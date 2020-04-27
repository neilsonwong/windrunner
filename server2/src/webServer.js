'use strict';

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const compress = require('koa-compress');
const serve = require('koa-static-with-spa');

const { API_PORT, API_VERSION, NG_ROOT } = require('../config.json');

const logger = require('./logger');
const router = require('./routes');

const app = new Koa();

// middlewares
app.use(cors());
app.use(compress({
  // filter: function (content_type) {
  // 	return /text/i.test(content_type)
  // },
  threshold: 2048,
  flush: require('zlib').Z_SYNC_FLUSH
}))
app.use(bodyParser({
  enableTypes: ['json'],
  jsonLimit: '10mb'
}));

// serve our website if it provides ngRoot
if (NG_ROOT) {
  app.use(serve(NG_ROOT, { spa: true, defer: true }));
}

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
