'use strict';

const winston = require('../../winston');
const executor = require('./executor');

async function duration(file){
	const cmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${file}"`;
	try {
		const duration = await executor.run(cmd);
		return Math.floor(duration);
	}
	catch (e) {
		winston.warn(`error getting video length for ${file}`)
		winston.warn(e);
		return -1;
	}
}

module.exports = {
	duration: duration
};
