'use strict';

const winston = require('../../winston');
const executor = require('./executor');

const backgroundTasks = [];

function init() {
  // add hook for executor is free
  executor.addHook(
    'backgroundWorkerService',
    executor.events.EXECUTOR_IDLE,
    tryRunningBackgroundJob
  );
}

function addBackgroundTask(fn) {
  backgroundTasks.push(fn);
}

// we will let the executor emit/tick the event
async function tryRunningBackgroundJob() {
  // we should not neet a semaphore here
  // if we have items in the bg queue
  if (backgroundTasks.length > 0) {
    // the original function should be the one to call execute, 
    // we just need to call their old functions
    const fn = backgroundTasks.shift();
    if (typeof fn === 'function') {
      winston.verbose('running background fn');
      await fn();
    }
  }
}

module.exports = {
  init: init,
  addBackgroundTask: addBackgroundTask
};
