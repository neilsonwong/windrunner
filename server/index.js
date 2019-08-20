'use strict';

require('module-alias/register');

const restapi = require('./src/restapi');
const executor = require('./src/services/cli/executor');
const { thumbnailService, sambaService } = require('./src/services/key');
const { backgroundWorker } = require('./src/services/infra');
// const remoteService = require('services/remoteService');

async function main() {
  // init executor
  executor.init();

  //handle remote share case
  // remoteService.init();

  // start actual services
  backgroundWorker.init();

  // start the rest api
  restapi.init();

  // start services that have long running tasks
  thumbnailService.startBackgroundTask();
  sambaService.startMonitoring();
}

main();