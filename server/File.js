'use strict';

const pathModule = require('path');
const SHARE_PATH = require('./config').SHARE_PATH;
const isPinned = require('./pins').isPinned;
const watchedTime = require('./watchTime').get;

//massages a fs stats object into a simpler custom file
class File {
	constructor(path, stats){
		this.name = pathModule.basename(path);
		this.path = path;
		this.rel = path.substring(SHARE_PATH.length);
		this.isDir = stats.isDirectory();
		this.size = stats.size;
		this.birthTime = stats.birthtime;
		this.pinned = this.isDir && isPinned(this.path);
		this.watchTime = watchedTime(path);
	}
}

module.exports = File;

