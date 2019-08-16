'use strict';

const File = require('./File');
// const isPinned = require('../persistentData/pins').isPinned;

class Folder extends File {
	constructor(path, stats, isPinned) {
		super(path, stats);
		this.pinned = this.isDir && isPinned;
	}
}

module.exports = Folder;
