'use strict';

const exec = require('child_process').exec;
const EventEmitter = require('events');

const config = require('../config');
const MAX_WORKERS = config.MAX_WORKERS;
const Command = require('../models/Command');

// initialize state vars
const cmdEvents = new EventEmitter();
const cmdQ = [];

// events
const CMD_ADD = 'CMD_ADDED';

let workersActive;

function init() {
	workersActive = 0;

	// attach events
	cmdEvents.on(CMD_ADD, processNext);
}

// add cmd to queue and wait til it is complete
function execute(cmdString) {
	return new Promise((res, rej) => {
		//add the cmd to the queue
		let command = new Command(cmdString);
		console.debug(`pushing command into the queue with id ${command.id}`);
		cmdQ.push(command);
		cmdEvents.emit(CMD_ADD);

		//add new event waiter for command to finish
		cmdEvents.once(command.id, (out, err) => {
			if (err) {
				return rej(err);
			}
			else {
				return res(out);
			}
		});
	});
}

//cleanup function, should never be called ideally
function cleanup() {
	return 'NOT YET IMPLEMENTED';
}

async function processNext() {
	if (workersActive >= MAX_WORKERS) {
		console.debug(`${MAX_WORKERS} workers are already active`);
		return;
	}
	else {
		console.debug(`worker #${workersActive} starting to work`);
		++workersActive;
	}

	if (cmdQ.length > 0) {
		//we have stuff to process
		const commandToRun = cmdQ.shift();
		let output = null;
		let error = null;

		try {
			output = await runCommand(commandToRun.cmdString);
		}
		catch (err) {
			error = err;
		}

		// emit the event
		cmdEvents.emit(commandToRun.id, output, error);
	}
	else {
		--workersActive;
		console.debug('no more items in command queue');
		console.debug(`${workersActive} workers left`);
	}
}

function runCommand(cmd) {
	return new Promise((res, rej) => {
		console.debug(`executing ${cmd}`);

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

init();

module.exports = {
	run: execute
};

