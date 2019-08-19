'use strict';

const path = require('path');
const moment = require('moment-timezone');

const executor = require('./executor');
const winston = require('../../winston');
const config = require('../../config');
const LockedFile = require('../../models/LockedFile');

const LIST_SAMBA_FILES_CMD = `sudo smbstatus -L`;
const REMOTE_SAMBA = config.REMOTE_HOST !== undefined;

async function lockedFiles() {
	try {
		const smbStatusString = await executor.run(LIST_SAMBA_FILES_CMD, null, REMOTE_SAMBA);
		if (smbStatusString && smbStatusString.indexOf('No locked files' === -1)) {
			let lockedFilesArray = smbStatusString.split('\n')
				.filter(filterLockedFile)
				.map(parseLockedFile)
				.filter(e => e != null);
			return lockedFilesArray;
		}
		else {
			winston.verbose('no locked files from smbstatus');
		}
	}
	catch (e) {
		winston.warn('an error occured when finding locked samba files');
		console.log(e);
		winston.warn(e);
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
	if (match) {
		const fullPath = path.join(config.SHARE_PATH, match[2]);
		if (isFile(fullPath)) {
			try {
				const lockDate = moment.tz(match[3], 'ddd MMM DD HH:mm:ss YYYY', 'America/Toronto');
				const lockDateMillis = lockDate.valueOf();
				return new LockedFile(fullPath, lockDateMillis);
			}
			catch (e) {
				winston.warn('error occurred when parsing the locked file');
				winston.warn(e);
				console.log(e)
			}
		}
	}
	return null;
}

//fake but most likely good enough for our filtering purposes (basically just check for file extension)
function isFile(pathItem) {
	return !!path.extname(pathItem);
}

module.exports = {
    lockedFiles: lockedFiles
};
