'use strict';

const backgroundWorker = require('./backgroundWorkerService');
const scheduler = require('./schedulerService');

module.exports = {
    backgroundWorker: backgroundWorker,
    scheduler: scheduler,
};
