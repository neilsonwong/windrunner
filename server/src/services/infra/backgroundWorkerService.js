'use strict';

const executor = require('../cli/executor');
const logger = require('../../logger');

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
  if (typeof fn === 'function') {
    backgroundTasks.push(fn);
  }
  else {
    logger.error('an attempt to add a non function to the background worker was detected');
    logger.error(new Error('non function in bgworker'));
  }
}

// we will let the executor emit/tick the event
async function tryRunningBackgroundJob() {
  // we should not neet a semaphore here
  // if we have items in the bg queue
  if (backgroundTasks.length > 0) {
    // the original function should be the one to call execute, 
    // we just need to call their old functions
    const fn = randomTask();
    await fn();
  }
}

function randomTask() {
  const randomIdx = Math.floor(Math.random() * backgroundTasks.length);
  const selected = backgroundTasks.splice(randomIdx, 1);
  return selected[0];
}

module.exports = {
  init: init,
  addBackgroundTask: addBackgroundTask
};
