'use strict';

const File = require('./File');
const watchedTime = require('./watchTime').get;

class Video extends File {
	constructor(path, stats, vidLen) {
		super(path, stats);
		this.watchTime = watchedTime(path);
		this.totalTime = vidLen;
	}
}

module.exports = Video;

