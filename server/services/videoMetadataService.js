'use strict';

const exec = require('../utils/executor').run;

async function duration(file){
	let cmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${file}"`;
	try {
		let duration = await exec(cmd);
		// let fDuration = parseFloat(duration) / 60;
		return Math.floor(duration);
	}
	catch (e) {
		// console.error(e);
		return -1;
	}
}

module.exports = {
	duration: duration
};
