'use strict';

const File = require('./File');
// const isPinned = require('../persistentData/pins').isPinned;

class Folder extends File {
	constructor(path, stats) {
		super(path, stats);
		// this.pinned = this.isDir && isPinned(this.path);
	}

	setPinned (isPinned) {
		this.pinned = this.isDir && isPinned;
	}
}

module.exports = Folder;
