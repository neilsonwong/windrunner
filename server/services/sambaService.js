'use strict';

const winston = require('../winston');
const config = require('../config');
const userComsumptionService = require('./userConsumptionService');
const lockedSambaFiles = require('./cli/samba').lockedFiles;
const scheduler = require('./schedulerService');

let lockHistory = {};

async function monitorSamba() {
	// get locked files
	winston.verbose('checking samba for locked files');
	const lockedFiles = await lockedSambaFiles();
	const archiveThese = diffLockHistories(lockHistory, lockedFiles);
	const updatePromises = [];

	for (let file in archiveThese) {
		const timeDiff = Date.now() - archiveThese[file];
		// update the watch time on these
		updatePromises.push(userComsumptionService.updateWatchTime(file, timeDiff));
	}

	winston.verbose(`updating watch times for ${Object.keys(archiveThese)}`);
	await Promise.all(updatePromises);
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

function startMonitoring() {
	scheduler.addTask('monitor Samba', monitorSamba, config.SMB_INTERVAL);
}

module.exports = {
	getLocked: lockedSambaFiles,
	startMonitoring: startMonitoring
};
