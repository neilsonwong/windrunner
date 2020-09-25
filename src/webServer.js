'use strict';

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const compress = require('koa-compress');
const serve = require('koa-static-with-spa');
const bearerToken = require('koa-bearer-token');

const logger = require('./logger');
const { API_PORT, API_VERSION, NG_ROOT } = require('../config.json');

const { publicRouter, semiPublicRouter, userRouter, adminRouter } = require('./routers');
const { authenticateGoogleAccessToken, isAdmin, isUser, parseRange } = require('./middleware');

const app = new Koa();

// middlewares
app.use(cors());
app.use(compress({
  // filter: function (content_type) {
  // 	return /text/i.test(content_type)
  // },
  threshold: 2048,
  flush: require('zlib').Z_SYNC_FLUSH
}))
app.use(bodyParser({
  enableTypes: ['json'],
  jsonLimit: '10mb'
}));

// serve our website if it provides ngRoot
if (NG_ROOT) {
  app.use(serve(NG_ROOT, { spa: true, defer: true }));
}

app.use(parseRange);

// public routes
app
  .use(publicRouter.routes())
  .use(publicRouter.allowedMethods());

// ONLY Populates ctx.state.user if valid
// oauth middleware
app.use(bearerToken());
app.use(authenticateGoogleAccessToken);

// semi public routes
// routes WORK publicly but have different behaviour when logged in
app
  .use(semiPublicRouter.routes())
  .use(semiPublicRouter.allowedMethods());

// requires valid bearer token
app.use(isUser);
app
  .use(userRouter.routes())
  .use(userRouter.allowedMethods())

// admins ONLY
// requires bearer token with email of admin
app.use(isAdmin);
app
  .use(adminRouter.routes())
  .use(adminRouter.allowedMethods());

// centralized error handler
app.on('error', async (err, ctx) => {
  if (err && err.code === 'EPIPE') {
    logger.verbose('stream epipe error, ignore');
    return;
  }
});

function start() {
  app.listen(9876);
  logger.info(`Windrunner API server (ver ${API_VERSION}) started on port ${API_PORT}`);
}

module.exports = {
  start
};
