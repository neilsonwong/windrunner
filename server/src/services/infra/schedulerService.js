'use strict';

const winston = require('../../logger');

function addTask(name, task, wait) {
  let recursiveTask = async function() {
    winston.verbose(`running scheduled task ${name}`);
    await task();
    setTimeout(recursiveTask, wait);
  };
  recursiveTask();
}

module.exports = {
  addTask: addTask
};
