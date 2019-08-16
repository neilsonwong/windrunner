'use strict';

const path = require('path');

const winston = require('../winston');
const executor = require('../utils/executor');
const LockedFile = require('../models/LockedFile');
const config = require('../config');
const userComsumptionService = require('./userConsumptionService');

const LIST_SAMBA_FILES_CMD = `sudo smbstatus -L`;
let lockHistory = {};

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
	return (!(lockedFileLine.length > 0 &&
		lockedFileLine.startsWith('Locked') ||
		lockedFileLine.startsWith('Pid') ||
		lockedFileLine.startsWith('---')));
}

function parseLockedFile(lockedFileLine) {
	/*
 '25062        1000       DENY_NONE  0x120089    RDONLY     LEASE(RWH)       /media/Seagate   anime movies/[MTBB] Kimi no Na Wa (1080p BD).mkv   Mon Jul  8 22:08:41 2019',
 '25062        1000       DENY_NONE  0x100081    RDONLY     NONE             /media/Seagate   .   Mon Jul  8 22:08:40 2019',
 '5405         1000       DENY_NONE  0x100081    RDONLY     NONE             /media/Lina   .   Mon Jul  8 22:21:50 2019',
 '5405         1000       DENY_NONE  0x100081    RDONLY     NONE             /media/Lina   .   Mon Jul  8 22:22:00 2019',
	*/
	const regexpString = `^[0-9]+[\\s]+[0-9]+[\\s]+[A-Z_]+[\\s]+[0-9x]+[\\s]+[A-Z]+[\\s]+[A-Z\\(\\)]+[\\s]+(${config.SHARE_PATH})[\\s]+(.*)   ([A-Za-z 0-9\\:]+)`;
	const lockedFileRegex = new RegExp(regexpString);

	const match = lockedFileRegex.exec(lockedFileLine);
	if (match ) {
		const fullPath = path.join(config.SHARE_PATH, match[2]);
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

// simply start the service and monitor every 2 minutes
async function monitorSamba() {
	// get locked files
	const lockedFiles = await lockedSambaFiles();
	const archiveThese = diffLockHistories(lockHistory, lockedFiles);
	for (let file in archiveThese) {
		const timeDiff = Date.now() - archiveThese[file];
		// update the watch time on these
		await userComsumptionService.updateWatchTime(file, timeDiff);
	}
	setTimeout(monitorSamba, config.SMB_INTERVAL);
}

function diffLockHistories(oldHistory, newHistory) {
	const archiveThese = {};
	for (let i = 0; i < oldHistory.length; ++i) {
		archiveThese[oldHistory[i].path] = oldHistory[i].time;
	}
	for (let j = 0; j < newHistory.length; ++j) {
		if (archiveThese[newHistory[i].path] !== undefined) {
			delete archiveThese[newHistory[i].path];
		}
	}
	return archiveThese;
}

monitorSamba();

module.exports = {
	getLocked: lockedSambaFiles,
};
