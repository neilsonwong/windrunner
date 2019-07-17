'use strict';

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const config = require('./config');

const ls = require('./utils/fileUtils').ls;
const find = require('./utils/fileUtils').find;
const pinned = require('./utils/fileUtils').pinned;
const pins = require('./persistentData/pins');
const smb = require('./cliCommands/sambaOps');

const addToThumbnailQueue = require('./cliCommands/thumbnail').addToThumbnailQueue;

let app = express();

process.title = process.argv[2];

app.use(cors());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());

app.get('/', (req, res) => {  
  res.send('Hello this is Sylvanas!');
});

//handle ls
app.get('/ls/:path(*)?', async (req, res) => {
  let path = req.params.path;
  if (!path){
    path = "";
  }
  let files = await ls(path); 
  res.send(JSON.stringify(files));
});

app.get('/find', async (req, res) => {
  let q = req.query.q;
  if (!q){
    q = "";
  }
  console.log('attempting to find ' + q)
  let files = await find(q);
  res.send(JSON.stringify(files));
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
  let files = await pinned();
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
    let results = await pins.add(pin);
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
    let results = await pins.del(pin);
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

/*
app.post('/mark/:filePath', async (req, res) => {
  let watched = req.body;
  console.log(`trying to unpin ${pin}`)
  if (!pin){
    res.sendStatus(204);
  }
  else {
    //remove pin
    let results = await pins.del(pin);
    console.log(results);
    res.sendStatus(200);
  }
});
*/

app.listen(config.PORT, function () {  
  console.log('windrunner listing server running on ' + config.PORT);  
});
