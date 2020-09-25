'use strict';

const config = require('../../config.json');
const maintenanceService = require('../services/maintenanceService');
const { networkInterfaces } = require('os');

const API_MAJOR_VERSION = Math.floor(config.API_VERSION);

function hello(ctx) {
  ctx.body = 'Sylvanas says hello';
}

function getServerInfo(ctx) {
  ctx.body = {
    version: config.API_VERSION,
    apiPrefix: `/api/v${API_MAJOR_VERSION}/`,
    port: config.API_PORT,
    lanIp: getLocalIp()
  };
}

function getLocalIp() {
  for (const netInt of Object.values(networkInterfaces())) {
    const localNetInts = netInt.filter(net => net.address.startsWith('192.168'));
    if (localNetInts.length > 0) {
      return localNetInts[0].address
    }
  }
  return null;
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
