'use strict';

const express = require('express');
const cors = require('cors');
const ls = require('./fileUtils').ls;

const app = express();

process.title = process.argv[2];

app.use(cors());

app.get('/', (req, res) => {  
  res.send('Hello this is dog!');
});

app.get('/ls/:path(*)?', async (req, res) => {
  let path = req.params.path;
  if (!path){
    path = "";
  }
  let files = await ls(path); 
  res.send(JSON.stringify(files));
});

app.listen(8000, function () {  
  console.log('Example app listening on port 8000!');  
});
