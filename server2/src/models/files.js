'use strict';

const { v4: uuidv4 } = require('uuid');
const fileUtil = require('../utils/fileUtil');

const FILETYPES = {
  BASE: 'BASE',
  BASIC: 'BASIC',
  DIR: 'DIRECTORY',
  VID: 'VIDEO'
};

// fast populated file for speed
class BaseFile {
  constructor(filePath) {
    this.type = FILETYPES.BASE;
    this.filePath = filePath;
    this.name = fileUtil.getFileName(filePath);
  }
}

// base file with extra properties
class BasicFile extends BaseFile {
  constructor(filePath, stats) {
    super(filePath);
    this.id = uuidv4();
    this.type = FILETYPES.BASIC;
    this.size = stats ? stats.size : undefined;
    this.created = stats ? stats.birthtime : undefined;
  }
}

class Directory extends BasicFile {
  constructor(filePath, stats) {
    super(filePath, stats);
    this.type = FILETYPES.DIR;
  }
}

class Video extends BasicFile {
  constructor(filePath, stats, videoStats) {
    super(filePath, stats);
    this.type = FILETYPES.VID;
    this.duration = videoStats.duration;
  }
}

module.exports = {
  FILETYPES,
  BaseFile,
  BasicFile,
  Directory,
  Video
};

