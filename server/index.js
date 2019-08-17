'use strict';

const restapi = require('./restapi');
const executor = require('./services/cli/executor');
const thumbnailService = require('./services/thumbnailService');
const sambaService = require('./services/sambaService');

function main() {
    // start the rest api
    restapi.init();

    // start services that have long running tasks
    executor.init();
    thumbnailService.startBackgroundTask();
    sambaService.startMonitoring();
}

main();