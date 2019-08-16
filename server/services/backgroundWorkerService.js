'use strict';

const executor = require('../utils/executor');

const backgroundTasks = [];

function init() {
    // add hook for executor is free
    executor.addHook(
        'backgroundWorkerService',
        executor.events.EXECUTOR_IDLE,
        tryRunningBackgroundJob
    );
}

function addBackgroundTask(task) {
    backgroundTasks.push(task);
}

function tryRunningBackgroundJob() {
    // we should not neet a semaphore here
    // if we have items in the bg queue
    if (backgroundTasks.length > 0) {
        executor.run(backgroundTasks.shift());
    }
}

init();

module.exports = {
    addBackgroundTask: addBackgroundTask
};
