'use strict';

// require('module-alias/register');

const restapi = require('./src/restapi');
const executor = require('./src/services/cli/executor');
const { thumbnailService } = require('./src/services/key');
const sambaService = require('./src/services/passive/sambaService');
const backgroundWorker = require('./src/services/infra/backgroundWorkerService');
const remoteService = require('./src/services/infra/remoteService');

async function main() {
  // init executor
  executor.init();

  //handle remote share case
  await remoteService.init();

  // start actual services
  backgroundWorker.init();

  // start the rest api
  restapi.init();

  // start services that have long running tasks
  thumbnailService.startBackgroundTask();
  sambaService.startMonitoring();
}

main();