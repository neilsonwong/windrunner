'use strict';

const Koa = require('koa');

const { API_PORT, API_VERSION } = require('../config.json');

const logger = require('./logger');
const router = require('./routes');

const app = new Koa();

app
    .use(router.routes())
    .use(router.allowedMethods());

function start() {
    app.listen(9876);
    logger.info(`Windrunner API server (ver ${API_VERSION}) started on ${API_PORT}`);
}

module.exports = {
    start
};
