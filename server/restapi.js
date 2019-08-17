'use strict';

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');

const winston = require('./winston');
const config = require('./config');

const fileNavRouter = require('./routers/fileNavigationRouter');
const thumbnailRouter = require('./routers/thumbnailRouter');
const userHabitsRouter = require('./routers/userHabitRouter');

let app = express();

process.title = process.argv[2];

function setup() {
  app.use((req, res, next) => {
    winston.info(req);
    return next();
  });
  app.use(compression());
  app.use(cors());
  // app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.text());
  app.use(fileNavRouter);
  app.use(thumbnailRouter);
  app.use(userHabitsRouter);
}

function defineRoutes() {
  app.get('/', (req, res) => {  
    res.send('Hello this is Sylvanas!');
  });
}

function initWebServer() {
  setup();
  defineRoutes();
  
  app.listen(config.PORT, function () {  
    winston.info(`windrunner server running on ${config.PORT}`);
  });
}

module.exports = {
  init: initWebServer
};
