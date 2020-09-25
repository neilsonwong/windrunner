'use strict';

const googleAuthMiddleware = require('./googleAuthMiddleware');
const isAdminMiddlewaare = require('./isAdminMiddleware');
const isUserMiddleware = require('./isUserMiddleware');
const rangeMiddlware = require('./rangeMiddleware');

module.exports = {
  authenticateGoogleAccessToken: googleAuthMiddleware,
  isAdmin: isAdminMiddlewaare,
  isUser: isUserMiddleware,
  parseRange: rangeMiddlware,
};
