'use strict';

const fs = require('fs');
const File = require('./File');
const Folder = require('./Folder');
const Video = require('./Video');
const getVidLen = require('./videoOps').duration;
const isVideo = new RegExp(/(\.(avi|mkv|ogm|mp4|flv|ogg|wmv|rm|mpeg|mpg)$)/);

const fDeets = function(file) {
	return new Promise((res, rej) => {
		fs.stat(file, async (err, stats) => {
			if (err) {
				return rej(err);
			}

			//determine what kind of file this is
			if (stats.isDirectory()) {
				res(new Folder(file, stats));
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
