'use strict';

const pathModule = require('path');
const SHARE_PATH = require('../config').SHARE_PATH;

//massages a fs stats object into a simpler custom file
class File {
  constructor(path, stats){
    this.name = pathModule.basename(path);
    this.path = path;
    this.rel = path.substring(SHARE_PATH.length);
    this.size = stats.size;
    this.birthTime = stats.birthtime;
    this.isDir = stats.isDirectory();
  }
}

module.exports = File;
