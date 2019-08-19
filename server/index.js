'use strict';

const restapi = require('./restapi');
const executor = require('./services/cli/executor');
const thumbnailService = require('./services/thumbnailService');
const sambaService = require('./services/sambaService');
const bgWorker = require('./services/cli/backgroundWorkerService');
const remoteService = require('./services/remoteService');

async function main() {
  // init executor
  executor.init();

  //handle remote share case
  remoteService.init();

  // start actual services
  bgWorker.init();

  // start the rest api
  restapi.init();

  // start services that have long running tasks
  thumbnailService.startBackgroundTask();
  sambaService.startMonitoring();
}

main();