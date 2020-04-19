'use strict';

const { v4: uuidv4 } = require('uuid');
const { sleep } = require('../utils');

const promises = {};

function getStatus(promiseId) {
  const status = promises[promiseId];
  if (status !== undefined) {
    if (typeof status === 'number') {
      console.log('promise finished at ' + (new Date(status)).toString());
      return true;
    }
    return false;
  }
  return true;
}

function add(promise) {
  const id = uuidv4();
  process(id, promise);
  return id;
}

async function process(id, promise) {
  // add to promise
  promises[id] = promise;
  await promise;

  // promise is done, let us put a time stamp
  promises[id] = Date.now();

  // sleep 10 minutes then remove from promises
  await sleep(600000);
  delete promises[id];
}

module.exports = {
  getStatus,
  add
}