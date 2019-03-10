'use strict';

const fs = require('fs');
const File = require('./File');

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

module.exports = {
	analyze: fDeets
};