'use strict';

const { exec, execFile } = require('child_process');
const execSSH = require('ssh-exec');
const EventEmitter = require('events');

const config = require('../../../config');
const logger = require('../../logger');
const { Command } = require('../../models');
const scheduler = require('../infra/schedulerService');
const { sleep } = require('../../utils');

const MAX_WORKERS = config.MAX_WORKERS;

// initialize state vars
const cmdEvents = new EventEmitter();
const cmdQ = [];
// const hooks = {};

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

  scheduler.addTask('check if executor is idle', watchForIdle, config.IDLE_INTERVAL);
}

function priorityExec(cmd, args, opts) {
  //add the cmd to the queue
  const command = new Command(cmd, args, opts);
  logger.debug(`pushing HIGH PRIORITY command into the queue with id ${command.id}`);
  cmdQ.unshift(command);
  return submit(command);
}

// add cmd to queue and wait til it is complete
function execute(cmd, args, opts) {
  // args can be null or undefined, that is OK.
  let command = new Command(cmd, args, opts);
  logger.debug(`pushing command into the queue with id ${command.id}`);
  cmdQ.push(command);
  return submit(command);
}

function submit(command) {
  cmdEvents.emit(EVENTS.CMD_ADD);

  return new Promise((res, rej) => {
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
  logger.debug(`worker has completed job ${jobId}`);
  --workersActive;
  logger.debug(`${workersActive} workers active`);
  processNext();
  return;
}

function retire() {
  logger.debug('a worker is retiring');
  --workersActive;
  logger.debug(`${workersActive} workers active`);
}

async function processNext() {
  if (workersActive >= MAX_WORKERS) {
    logger.debug(`${MAX_WORKERS} workers are already active`);
    return;
  }
  else {
    ++workersActive;
    logger.debug(`worker #${workersActive} starting to work`);
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
    logger.trace('no more items in command queue');
    cmdEvents.emit(EVENTS.WORKER_RETIRE);
  }
}

function runCommand(cmd) {
  if (cmd.runRemotely) {
    return runCommandRemotely(cmd);
  }
  else {
    return runCommandLocally(cmd);
  }
}

function isBusy() {
  return workersActive !== 0;
}

// mainly used to add additional hooks into the executor life cycle
function addHook(src, event, hook) {
  logger.info(`${src} is adding an executor hook on ${event}`);
  cmdEvents.on(event, hook);
}

//TODO: add remove hook

async function watchForIdle() {
  if (workersActive === 0) {
    await sleep(config.IDLE_TRIGGER_TIME);
    if (workersActive === 0) {
      cmdEvents.emit(EVENTS.EXECUTOR_IDLE);
    }
  }
}

function runCommandRemotely(cmd) {
  return new Promise((res, rej) => {
    if (config.REMOTE_HOST) {
      //if args, we have to normalize
      const commandString = cmd.toStringCmd();
      logger.info(`executing remotely using ssh-exec ${commandString}`);
      execSSH(commandString, config.REMOTE_HOST, handleExecutionResult.bind(cmd, res, rej));
    }
    else {
      logger.error('attempt to run remote command without remote host specified');
      return rej('attempt to run remote command without remote host specified');
    }
  });
}

const execOptions = { maxBuffer: Infinity };
function runCommandLocally(cmd) {
  return new Promise((res, rej) => {
    if (cmd.args === undefined) {
      logger.debug(`executing using exec ${cmd.cmd}`);
      exec(cmd.cmd, execOptions, handleExecutionResult.bind(cmd, res, rej));
    }
    else {
      logger.debug(`executing using execFile ${cmd.cmd} ${cmd.args}`);
      execFile(cmd.cmd, cmd.args, execOptions, handleExecutionResult.bind(cmd, res, rej));
    }
  });
}

function handleExecutionResult(res, rej, err, stdout, stderr) {
  // this = cmd lol
  if (err !== null) {
    logger.warn(`executor command returned an error for command ${this.toStringCmd()}`);
    logger.warn(this.toStringCmd());
    logger.warn(err);
    rej(err);
  }
  else if (stderr){
    logger.warn(`executor command returned a stderr for command ${this.toStringCmd()}`);
    logger.warn(this.toStringCmd());
    logger.warn(stderr);
    rej(stderr);
  }
  else {
    logger.verbose(`executor command finished successfully for command ${this.toStringCmd()}`);
    // if (stdout && stdout.length < 300) {
    // 	logger.verbose(`results: ${stdout}`);
    // }
    // else {
    // 	logger.silly(`results: ${stdout}`);
    // }
    res(stdout);
  }
}

module.exports = {
  run: execute,
  rush: priorityExec,
  isBusy: isBusy,
  addHook: addHook,
  events: EVENTS,
  init: init,
  cleanup: cleanup,
};
