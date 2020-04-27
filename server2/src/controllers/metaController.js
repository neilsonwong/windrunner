'use strict';

const config = require('../../config.json');

const executor = require('../services/cli/executor');

function hello(ctx) {
  ctx.body = 'Sylvanas says hello';
}

function getServerInfo(ctx) {
  ctx.body = {
    version: config.API_VERSION,
    apiPrefix: `/api/v${config.API_VERSION}/`,
    port: config.API_PORT
  };
}

function getExecLoad(ctx) {
  ctx.body = executor.health();
}

module.exports = {
  hello,
  getServerInfo,
  getExecLoad,
};
