'use strict';

const config = require('../../config.json');
const executor = require('../services/cli/executor');
const maintenanceService = require('../services/maintenanceService');

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

// streaming apis for maintenance

function getConsoleStream(ctx) {
  maintenanceService.streamLogsToBody(ctx);
}

function getLoadStream(ctx) {
  maintenanceService.streamLoadToBody(ctx);
}

module.exports = {
  hello,
  getServerInfo,
  getLoadStream,
  getConsoleStream
};
