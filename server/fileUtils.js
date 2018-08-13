'use strict';

const fs = require('fs');
const path = require('path');
const File = require('./File');

const SHARE_PATH = require('./config').SHARE_PATH;

//file should be an absolute path relative to the share
async function ls(rel){
	let file = path.join(SHARE_PATH, rel);
	let fileDetails = null;

	try {
		fileDetails = await fDeets(file);
	}
	catch(e) {
		console.log(e);
		return [];
	}

	if (fileDetails.isDir){
		console.log("listing dir " + file)
		return listDir(file);
	}
	else {
		//not a dir, return the ls deets
		console.log("listing file " + file)
		return [fileDetails];
	}
}

const fDeets = function(file) {
	return new Promise((res, rej) => {
		fs.stat(file, (err, stats) => {
			if (err) {
				return rej(err);
			}
			res(new File(file, stats));
		});
	});
}

const listDir = function(dir){
	return new Promise((res, rej) => {
		fs.readdir(dir, async function(err, items) {
			items = items.filter(item => !(/(^|\/)\.[^\/\.]/g.test(item)));
			if (err){
				rej(err);
			}
			res(await Promise.all(items.map(async (item) => {
				let file = path.join(dir, item);
				return fDeets(file);
			})));
		});
	});
};

module.exports = {
	ls: ls
};