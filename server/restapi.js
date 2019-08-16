'use strict';

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const winston = require('./winston');
const config = require('./config');
const fileNavRouter = require('./routers/fileNavigationRouter');
const pinned = require('./services/navigatorService').pinned;
const userConsumptionService = require('./services/userConsumptionService');
const smb = require('./services/sambaService');

const addToThumbnailQueue = require('./services/thumbnailService').addToThumbnailQueue;

let app = express();

process.title = process.argv[2];

function setup() {
  app.use(cors());
  // app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.text());
  app.use(fileNavRouter);
}

function defineRoutes() {
  app.get('/', (req, res) => {  
    res.send('Hello this is Sylvanas!');
  });

  app.use('/thumb/:filePath', function (req, res, next) {
    let filename = path.basename(req.params.filePath);
    let imgPath = path.join(config.THUMBNAIL_DIR, filename + '.jpg');

    //check if file exists
    fs.access(imgPath, fs.constants.R_OK, (err) => {
      if (!err){
        // console.log('sending ' + imgPath)
        res.sendFile(imgPath);
      }
      else {
        //thumbnail not generated, fire call to make it
        addToThumbnailQueue(req.params.filePath, filename);

        //send a generic back for now
        // res.sendFile('video.png', { root: __dirname });
        res.send("OK");
      }
    });
  });

  app.get('/pins', async (req, res) => {
    let files = await userConsumptionService.getPinned();
    res.send(JSON.stringify(files));
  });

  app.post('/pins/add', async (req, res) => {
    let pin = req.body;
    console.log(`trying to pin ${pin}`)
    if (!pin){
      res.sendStatus(204);
    }
    else {
      //add pin
      let results = await userConsumptionService.addPin(pin);
      console.log(results);
      res.sendStatus(201);
    }
  });

  app.post('/pins/del', async (req, res) => {
    let pin = req.body;
    console.log(`trying to unpin ${pin}`)
    if (!pin){
      res.sendStatus(204);
    }
    else {
      //remove pin
      let results = await userConsumptionService.removePin(pin);
      console.log(results);
      res.sendStatus(200);
    }
  });

  app.get('/record', async (req, res) => {
    //check if we need to record
    console.log('start recording watched');
    smb.watch();
    res.sendStatus(200);
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
}
