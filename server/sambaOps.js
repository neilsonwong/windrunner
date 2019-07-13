'use strict';

const exec = require('child_process').exec;
const SHARE_PATH = '/media/Seagate';

const lockedSambaFiles = async function() {
	let smbStatusString = await smbstatus();
	let lockedFiles = smbStatusString.substring(smbStatusString.indexOf('Locked files:'));
	let lockedFilesArray = lockedFiles.split('\n').filter(filterLockedFile).map(parseLockedFile).filter(e => e != null);
	console.log(lockedFilesArray);
}

const smbstatus = function() {
	let cmd = `sudo smbstatus`;
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

function filterLockedFile(lockedFileLine) {
	if (lockedFileLine.length > 0 &&
		lockedFileLine.startsWith('Locked') ||
		lockedFileLine.startsWith('Pid') ||
		lockedFileLine.startsWith('---')) {
		return false;
	}
	return true;
}

function parseLockedFile(lockedFileLine) {
	console.log(lockedFileLine);
	/*
 '25062        1000       DENY_NONE  0x120089    RDONLY     LEASE(RWH)       /media/Seagate   anime movies/[MTBB] Kimi no Na Wa (1080p BD).mkv   Mon Jul  8 22:08:41 2019',
 '25062        1000       DENY_NONE  0x100081    RDONLY     NONE             /media/Seagate   .   Mon Jul  8 22:08:40 2019',
 '5405         1000       DENY_NONE  0x100081    RDONLY     NONE             /media/Lina   .   Mon Jul  8 22:21:50 2019',
 '5405         1000       DENY_NONE  0x100081    RDONLY     NONE             /media/Lina   .   Mon Jul  8 22:22:00 2019',

	*/
	//let lockedFileRegex = new RegExp(`^[0-9]+[\s]+[0-9]+[\s]+[A-Z_]+[\s]+[0-9x]+[\s]+[A-Z]+[\s]+[A-Z\(\)]+[\s]+(${SHARE_PATH})[\s]+(.*)   ([A-Za-z 0-9\:]+)`);
	let lockedFileRegex = /^[0-9]+[\s]+[0-9]+[\s]+[A-Z_]+[\s]+[0-9x]+[\s]+[A-Z]+[\s]+[A-Z\(\)]+[\s]+(\/media\/Seagate)[\s]+(.*)   ([A-Za-z 0-9\:]+)/g;
	let match = lockedFileRegex.exec(lockedFileLine);
	if (match) {
		console.log(match);
		if (match[2] != '.') {
			return new LockedFile(match[2], match[3]);
		}
	}
	return null;
}

function LockedFile(path, time) {
	this.path = path;
	this.time = time;
}

module.exports = {
	getLocked: lockedSambaFiles
};

async function main() {
	await lockedSambaFiles();
}

main();
