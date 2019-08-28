'use strict';

const execFile = require('child_process').execFile;

// https://askubuntu.com/questions/704160/list-all-recently-changed-files-recursiveo
// find . -type f -mtime -7 -exec ls -l {} \; 
// find . -type f -mtime -2 -ls

let dir = '/home/dt224292/Neilson';
let days = 2;

async function main() {
	let msg = await new Promise((res, rej) => {
		let cmd = 'find';
		let args = [
			dir,
			'-type',
			'f',
			'-mtime',
			`-${days}`,
			'-ls'
		];

		execFile(cmd, args, (err, stdout, stderr) => {
			if (err) {
				console.log('reject');
				rej(err);
				return;
			}
			else 
			if (stderr) {
				console.log('reject');
				rej(stderr);
				return;
			}
			console.log('resolve');
			res(stdout);
			return;
		});
	});
	console.log(msg);
}

main();
