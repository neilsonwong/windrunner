'use strict';

const exec = require('child_process').exec;

function execute(cmd){
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
				res(stdout);
			}
		});
	});
}

module.exports = {
	exec: execute
};

