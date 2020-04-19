'use strict';

const { v4: uuidv4 } = require('uuid');
const fileUtil = require('../utils/fileUtil');

const FILETYPES = {
  BASE: 'BASE',
  BASIC: 'BASIC',
  DIR: 'DIRECTORY',
  SERIES: 'SERIES',
  VID: 'VIDEO',
  INVALID: 'INVALID'
};

// fast populated file for speed
class BaseFile {
  constructor(filePath) {
    this.type = FILETYPES.BASE;
    this.filePath = filePath;
    this.rel = fileUtil.getPathRelativeToRoot(filePath);
    this.name = fileUtil.getFileName(filePath);
    this.promised = undefined;
  }
}

class InvalidFile extends BaseFile {
  constructor(filePath) {
    super(filePath);
    this.type = FILETYPES.INVALID;
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
  constructor(filePath, stats, isSeriesLeafNode) {
    super(filePath, stats);
    this.type = FILETYPES.DIR;
    this.isSeriesLeafNode = isSeriesLeafNode;
    this.newFiles = undefined;
  }
}

class SeriesDirectory extends Directory {
  constructor(filePath, stats, isSeriesLeafNode, aniListData) {
    super(filePath, stats, isSeriesLeafNode);
    this.type = FILETYPES.SERIES;
    this.aniListData = aniListData;
  }
}

class Video extends BasicFile {
  constructor(filePath, stats, videoStats, thumbnails) {
    super(filePath, stats);
    this.type = FILETYPES.VID;
    this.duration = videoStats.duration;
    this.thumbnail = thumbnails || [];
  }
}

module.exports = {
  FILETYPES,
  BaseFile,
  InvalidFile,
  BasicFile,
  Directory,
  SeriesDirectory,
  Video
};

