'use strict';

const fs = require('fs');
const path = require('path');
const File = require('./File');
const exec = require('child_process').exec;

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
		// console.log("listing file " + file)
		return [fileDetails];
	}
}

//find files in a dir
async function find(q){
	if (q === ''){
		console.log("no query passed");
		return [];
	}
	try {
		//find all absolute file paths
		let results = await search(q);
		results = results.split('\n').filter((filename) => (filename.length > 0));

		//make files for all of them
		let details = await Promise.all(results.map((item) => {
			let deets = undefined;
			//handle errors here
			try {
				deets = fDeets(item);
			}
			catch(e){
				console.log('fdeet error');
				console.log(e)
			}
			return deets;
		}));

		//filter out empties
		return details.filter(x => (x !== undefined));
	}
	catch(e){
		console.log(e);
	}
}

const fDeets = function(file) {
	return new Promise((res, rej) => {
		fs.stat(file, (err, stats) => {
			if (err) {
				return rej(err);
			}
			// console.log("making file for " + file);
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
			// console.log('items filtered')
			let details = await Promise.all(items.map((item) => {
				let file = path.join(dir, item);
				let deets = undefined;
				//handle errors here
				try {
					deets = fDeets(file);
				}
				catch(e){
					console.log(e)
				}
				return deets;
			}));

			// console.log('filter out errors');

			//filter out empties
			let finals = details.filter(x => (x !== undefined));

			// console.log('donezo');
			res(finals);
		});
	});
};

function search(q){
	let cmd = `find ${SHARE_PATH} -iname "*${q}*"`;
	return new Promise((res, rej) => {
		exec(cmd, { maxBuffer: Infinity }, (err, stdout, stderr) => {
			if (err !== null){
				console.log("error occurred");
				rej(err);
			}
			else if (stderr){
				console.log("std error occurred");
				rej(stderr);
			}
			else {
				console.log(stdout);
				res(stdout);
			}
		});
	});
}

module.exports = {
	ls: ls,
	find: find
};