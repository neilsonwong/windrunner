'use strict';

const File = require('./File');
const watchedTime = require('../persistentData/watchTime').get;

class Video extends File {
	constructor(path, stats, vidLen) {
		super(path, stats);
		this.watchTime = watchedTime(path);
		this.totalTime = vidLen;
		this.thumbnails = [];
	}
}

module.exports = Video;
