'use strict';

const fs = require('fs');
const File = require('../models/File');
const Folder = require('../models/Folder');
const Video = require('../models/Video');
const getVidLen = require('../cliCommands/videoOps').duration;
const isVideo = new RegExp(/(\.(avi|mkv|ogm|mp4|flv|ogg|wmv|rm|mpeg|mpg)$)/);
const isPinned = require('../persistentData/pins').isPinned;


const fDeets = function(file) {
	return new Promise((res, rej) => {
		fs.stat(file, async (err, stats) => {
			if (err) {
				return rej(err);
			}

			//determine what kind of file this is
			if (stats.isDirectory()) {
				let folder = new Folder(file, stats);
				folder.setPinned(isPinned(folder.path));
				res(folder);
			}
			else if (isVideo.test(file)) {
				let vidLen = await getVidLen(file);
				res(new Video(file, stats, vidLen));
			}
			else {
				res(new File(file, stats));
			}
		});
	});
}

module.exports = {
	analyze: fDeets
};
