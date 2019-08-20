'use strict';

const File = require('./File');

class Video extends File {
  constructor(path, stats, vidLen, watchedTime) {
    super(path, stats);
    this.watchTime = watchedTime;
    this.totalTime = vidLen;
  }
}

module.exports = Video;
