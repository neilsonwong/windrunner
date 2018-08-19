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
		try {
			return (await listDir(file));
		}
		catch(e) {
			console.log(e);
			return [];
		}
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
			//remove hidden files
			items = items.filter(item => !(/(^|\/)\.[^\/\.]/g.test(item)));
			if (err){
				rej(err);
			}
			let details = await Promise.all(items.map(async (item) => {
				let file = path.join(dir, item);
				let deets = undefined;
				//handle errors here
				try {
					deets = await fDeets(file);
				}
				catch(e){
					console.log(e)
				}
				return deets;
			}));

			//filter out empties
			res(details.fileter(x => (x !== undefined)));
		});
	});
};

module.exports = {
	ls: ls
};