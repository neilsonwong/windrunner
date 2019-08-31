'use strict';

const pathModule = require('path');
const SHARE_PATH = require('../../config').SHARE_PATH;
const { getFileType } = require('../utils');

//massages a fs stats object into a simpler custom file
class File {
  constructor(path, stats, metadata) {
    this.name = pathModule.basename(path);
    this.path = path;
    this.rel = path.substring(SHARE_PATH.length);
    this.type = getFileType(path, stats);
    this.size = stats ? stats.size : undefined;
    this.birthTime = stats ? stats.birthtime: undefined;
    this.metadata = metadata || {};
  }

  setMetadata(metadata) {
    this.metadata = metadata || {};
  }
}

// TODO: add file definitions version
module.exports = File;
