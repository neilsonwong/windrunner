'use strict';

const googleAuthMiddleware = require('./googleAuthMiddleware');
const isAdminMiddlewaare = require('./isAdminMiddleware');
const isUserMiddleware = require('./isUserMiddleware');
const rangeMiddlware = require('./rangeMiddleware');

module.exports = {
  googleAuthMiddleware,
  isAdminMiddlewaare,
  isUserMiddleware,
  rangeMiddlware,
};
