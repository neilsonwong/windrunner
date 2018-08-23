'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const config = require('./config');

const ls = require('./fileUtils').ls;
const makeThumbnail = require('./thumbnail').makeThumbnail;

const app = express();

process.title = process.argv[2];

app.use(cors());

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

app.use('/thumb/:filePath', function (req, res, next) {
  let filename = path.basename(req.params.filePath);
  let imgPath = path.join(config.THUMBNAIL_DIR, filename + '.jpg');

  //check if file exists
  fs.access(imgPath, fs.constants.R_OK, (err) => {
    if (!err){
      res.sendFile(imgPath);
    }
    else {
      //thumbnail not generated, fire call to make it
      makeThumbnail(req.params.filePath, filename);

      //send a generic back for now
      // res.sendFile('video.png', { root: __dirname });
      res.send("OK");
    }
  });
});

app.listen(8000, function () {  
  console.log('Example app listening on port 8000!');  
});
