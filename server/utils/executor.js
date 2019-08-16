'use strict';

const exec = require('child_process').exec;
const execFile = require('child_process').execFile;
const EventEmitter = require('events');

const winston = require('../winston');
const config = require('../config');
const MAX_WORKERS = config.MAX_WORKERS;
const Command = require('../models/Command');
const sleep = require('../utils/utility').sleep;

// initialize state vars
const cmdEvents = new EventEmitter();
const cmdQ = [];
const hooks = {};

// events
const EVENTS = {
	CMD_ADD: 'CMD_ADDED',
	CMD_DONE: 'CMD_DONE',
	WORKER_RETIRE: 'WORKER_RETIRE',
	EXECUTOR_IDLE: 'EXECUTOR_IDLE',
};

let workersActive;

function init() {
	workersActive = 0;

	// attach events
	cmdEvents.on(EVENTS.CMD_ADD, processNext);
	cmdEvents.on(EVENTS.CMD_DONE, packUp);
	cmdEvents.on(EVENTS.WORKER_RETIRE, retire);
}

// add cmd to queue and wait til it is complete
function execute(cmd, args) {
	// args can be null or undefined, that is OK.
	return new Promise((res, rej) => {
		//add the cmd to the queue
		let command = new Command(cmd, args);
		winston.silly(`pushing command into the queue with id ${command.id}`);
		cmdQ.push(command);
		cmdEvents.emit(EVENTS.CMD_ADD);

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

function packUp(jobId) {
	winston.silly(`worker has completed job ${jobId}`);
	--workersActive;
	winston.silly(`${workersActive} workers active`);
	processNext();
	return;
}

function retire() {
	winston.silly(`a worker is retiring`);
	--workersActive;
	winston.silly(`${workersActive} workers active`);
	triggerPossibleIdle();
}

async function processNext() {
	if (workersActive >= MAX_WORKERS) {
		winston.silly(`${MAX_WORKERS} workers are already active`);
		return;
	}
	else {
		++workersActive;
		winston.silly(`worker #${workersActive} starting to work`);
	}

	if (cmdQ.length > 0) {
		//we have stuff to process
		const commandToRun = cmdQ.shift();
		let output = null;
		let error = null;

		try {
			output = await runCommand(commandToRun);
		}
		catch (err) {
			error = err;
		}

		// emit the event
		cmdEvents.emit(commandToRun.id, output, error);
		cmdEvents.emit(EVENTS.CMD_DONE, commandToRun.id);
	}
	else {
		winston.silly('no more items in command queue');
		cmdEvents.emit(EVENTS.WORKER_RETIRE);
	}
}

function runCommand(cmd) {
	return new Promise((res, rej) => {
		if (cmd.args === undefined) {
			winston.silly(`executing using exec ${cmd.cmd}`);
			exec(cmd.cmd, { maxBuffer: Infinity }, handleExecutionResult.bind(null, res, rej));
		}
		else {
			winston.silly(`executing using execFile ${cmd.cmd}`);
			execFile(cmd.cmd, cmd.args, handleExecutionResult.bind(null, res, rej));
		}
	});
}

function handleExecutionResult(res, rej, err, stdout, stderr) {
	if (err !== null) {
		winston.debug('executor command returned an error');
		winston.debug(err);
		rej(err);
	}
	else if (stderr){
		winston.debug('executor command returned a stderr');
		winston.debug(stderr);
		rej(stderr);
	}
	else {
		res(stdout);
	}
}

function isBusy() {
	return workersActive !== 0;
}

// mainly used to add additional hooks into the executor life cycle
function addHook(src, event, hook) {
	winston.info(`${src} is adding an executor hook on ${event}`);
	cmdEvents.on(event, hook);
}

//TODO: add remove hook

async function triggerPossibleIdle() {
	if (workersActive === 0) {
		await sleep(5000);
		if (workersActive === 0) {
			cmdEvents.emit(EVENTS.EXECUTOR_IDLE);
		}
	}
}

init();

module.exports = {
	run: execute,
	isBusy: isBusy,
	addHook: addHook,
	events: EVENTS,
};
