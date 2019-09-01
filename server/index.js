'use strict';

// require('module-alias/register');

const restapi = require('./src/restapi');
const executor = require('./src/services/cli/executor');
const backgroundWorker = require('./src/services/infra/backgroundWorkerService');
const remoteService = require('./src/services/infra/remoteService');

const sambaService = require('./src/services/passive/sambaService');
const librarianService = require('./src/services/passive/librarianService');

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
  librarianService.startBackgroundTask();
  sambaService.startMonitoring();
}

main();