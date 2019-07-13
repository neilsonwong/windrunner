'use strict';

const File = require('./File');
const isPinned = require('./pins').isPinned;

class Folder extends File {
	constructor(path, stats) {
		super(path, stats);
		this.pinned = this.isDir && isPinned(this.path);
	}
}

module.exports = Folder;

