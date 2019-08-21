'use strict';

const logger = require('../../logger');

function addTask(name, task, wait) {
  let recursiveTask = async function() {
    logger.verbose(`running scheduled task ${name}`);
    await task();
    setTimeout(recursiveTask, wait);
  };
  recursiveTask();
}

module.exports = {
  addTask: addTask
};
