'use strict';

const adminRouter = require('./adminRouter');
const publicRouter = require('./publicRouter');
const semiPublicRouter = require('./semiPublicRouter');
const userRouter = require('./userRouter');

module.exports = {
  adminRouter,
  publicRouter,
  semiPublicRouter,
  userRouter
};