'use strict';

const { exec, execFile } = require('child_process');
const genericPool = require('generic-pool');
const { MAX_CLI_PRIORITY_WORKERS, MAX_CLI_WORKERS } = require('../../../config.json');
const logger = require('../../logger');
const { Worker, Command } = require('../../models/cli');

const execOptions = { maxBuffer: Infinity };

const factory = {
  create: () => Promise.resolve(new Worker()),
  destroy: () => Promise.resolve()
};

const pool = genericPool.createPool(factory, { max: MAX_CLI_WORKERS, priorityRange: 1 });
const priorityPool = genericPool.createPool(factory, { max: MAX_CLI_PRIORITY_WORKERS });

function runImmediately(cmd, args, opts) {
  return run(cmd, args, opts, true);
}

async function run(cmd, args, opts, now) {
  // args can be null or undefined, thaut is OK.
  const command = new Command(cmd, args, opts);
  logger.debug(`pushing command into the queue with id ${command.id}`);

  try  {
    const { pool:poolToUse, priority } = acquirePoolAndPriority(now);

    if (cmd.indexOf('ffmpeg') < 0) {
      console.log(`cmd: ${cmd}\npriority: ${priority}`);
    }
    const worker = await poolToUse.acquire(priority);
    const output = await runCommand(command);
    poolToUse.release(worker);
    return output;
  }
  catch (err) {
    logger.error(err);
  }
}

function acquirePoolAndPriority(now) {
  if (now) {
    if (priorityPool.pending < 5) {
      return {
        pool: priorityPool,
        priority: undefined
      }
    }
    else {
      return {
        pool: pool,
        priority: 0
      }
    }
  }
  else {
    return { pool };
  }
}

function runCommand(cmd) {
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

async function shutdown() {
  await Promise.all([pool.drain(), priorityPool.drain()]);
  pool.clear();
  priorityPool.clear();
}

function health() {
  return {
    priority: {
      max: priorityPool.max,
      size: priorityPool.size,
      available: priorityPool.available,
      waiting: priorityPool.pending
    },
    regular: {
      max: pool.max,
      size: pool.size,
      available: pool.available,
      waiting: pool.pending
    }
  };
}

setInterval(() => {
  console.log(health());
}, 5000)

module.exports = {
  runImmediately,
  run,
  shutdown,
  health
};
