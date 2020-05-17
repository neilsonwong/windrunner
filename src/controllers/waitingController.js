'use strict';

const pendingResourceService = require('../services/pendingResourceService');
const PromiseStatus = require('../models/promiseStatus');

async function getStatus(ctx) {
  const promiseId = decodeURIComponent(ctx.params.id);
  const status = pendingResourceService.getStatus(promiseId);
  ctx.body = new PromiseStatus(promiseId, status);
}

module.exports = {
  getStatus
};
