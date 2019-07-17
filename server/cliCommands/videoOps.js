'use strict';

const exec = require('../executor/execUtils').exec;

async function duration(file){
	let cmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${file}"`;
	let duration = await exec(cmd);
	try {
		let fDuration = parseFloat(duration) / 60;
		return Math.round(fDuration);
	}
	catch (e) {
		console.log(e);
		return -1;
	}
}

module.exports = {
	duration: duration
};

