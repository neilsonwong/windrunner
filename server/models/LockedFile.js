'use strict';

//represents a file that has been locked in samba
class LockedFile {
	constructor(path, time){
		this.path = path;
		this.time = time;
	}
}

module.exports = LockedFile;
