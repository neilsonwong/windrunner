'use strict';

const path = require('path');

const winston = require('../winston');
const executor = require('../utils/executor');
const LockedFile = require('../models/LockedFile');
const SHARE_PATH = require('../config').SHARE_PATH;

const LIST_SAMBA_FILES_CMD = `sudo smbstatus -L`;

let alreadyMonitoring = false;

const lockedSambaFiles = async function() {
	try {
		const smbStatusString = await executor.run(LIST_SAMBA_FILES_CMD);
		let lockedFilesArray = smbStatusString.split('\n')
			.filter(filterLockedFile)
			.map(parseLockedFile)
			.filter(e => e != null);
		return lockedFilesArray;
	}
	catch (e) {
		winston.error('an error occured when finding locked samba files');
	}
	return [];
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
	/*
 '25062        1000       DENY_NONE  0x120089    RDONLY     LEASE(RWH)       /media/Seagate   anime movies/[MTBB] Kimi no Na Wa (1080p BD).mkv   Mon Jul  8 22:08:41 2019',
 '25062        1000       DENY_NONE  0x100081    RDONLY     NONE             /media/Seagate   .   Mon Jul  8 22:08:40 2019',
 '5405         1000       DENY_NONE  0x100081    RDONLY     NONE             /media/Lina   .   Mon Jul  8 22:21:50 2019',
 '5405         1000       DENY_NONE  0x100081    RDONLY     NONE             /media/Lina   .   Mon Jul  8 22:22:00 2019',

	*/
	const regexpString = `^[0-9]+[\\s]+[0-9]+[\\s]+[A-Z_]+[\\s]+[0-9x]+[\\s]+[A-Z]+[\\s]+[A-Z\\(\\)]+[\\s]+(${SHARE_PATH})[\\s]+(.*)   ([A-Za-z 0-9\\:]+)`;
	const lockedFileRegex = new RegExp(regexpString);

	const match = lockedFileRegex.exec(lockedFileLine);
	if (match ) {
		const fullPath = path.join(SHARE_PATH, match[2]);
		if (isFile(fullPath)) {
			try {
				const date = Date.parse(match[3]);
				return new LockedFile(fullPath, date);
			}
			catch (e) {
				winston.error('error occurred when parsing the locked file');
				winston.error(e);
			}
		}
	}
	return null;
}

/*
async function monitorSambaFiles() {
	if (alreadyMonitoring) {
		winston.debug('already monitoring samba');
		return;
	}

	//////////////////////////////////
	// use semaphore
	// START CRITICAL SECTION
	//////////////////////////////////
	
	alreadyMonitoring = true;
	let watchDurations = {};
	let locked = true;
	while (locked) {
		//get locked files
		let lockedFiles = await lockedSambaFiles();

		//update watched time
		for (let i = 0; i < lockedFiles.length; ++i) {
			if (watchDurations[lockedFiles[i].path] === undefined) {
				watchDurations[lockedFiles[i].path] = 0;
			}
			else {
				++watchDurations[lockedFiles[i].path];
			}
		}

		//update bool var
		if (lockedFiles.length < 1) {
			break;
		}
		await sleep(60000);
	}

	winston.debug('no more locked files');

	for (let filename in watchDurations) {
		await watchTime.addTime(filename, watchDurations[filename]);
	}

	alreadyMonitoring = false;

	//////////////////////////////////
	// END CRITICAL SECTION
	//////////////////////////////////
	return;
}

function sleep(ms) {
	return new Promise(r => setTimeout(r,ms));
}

//fake but most likely good enough for our filtering purposes (basically just check for file extension)
function isFile(pathItem) {
	return !!path.extname(pathItem);
}
*/

module.exports = {
	getLocked: lockedSambaFiles,
	// watch: monitorSambaFiles 
};

// async function main() {
// 	await monitorSambaFiles();
// }

// main();
