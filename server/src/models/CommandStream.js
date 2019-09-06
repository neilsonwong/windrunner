'use strict';

const EventEmitter = require('events');
const logger = require('../logger');
const sleep = require('../utils');

class CommandStream extends EventEmitter{
  constructor(spawned) {
    super();
    this.raw = spawned;
    this.stderr = '';
    this.ended = false;

    // for stream processing
    this.isReady = false;
    this.lines = [];
    this.leftovers = '';

    // attach our custom event handlers
    spawned.stdout.on('data', (data) => {
      // push data split by new lines into lines
      const splitData = (this.leftovers + data).split('\n');
      for (let i = 0; i < (splitData.length-1); ++i) {
        const dataline = splitData[i];
        this.lines.push(dataline);
        if (this.isReady) {
          this.emit('line', dataline);
        }
      }

      // last line is a special case
      // if it ends with a \n we know it has already been added
      // if not it is a leftover, we need to append to the next chunk
      const lastPart = splitData[splitData.length-1];
      this.leftovers = lastPart;        
    });
    spawned.stderr.on('data', onStdErr.bind(this));
    spawned.on('exit', () => {
      this.ended = true;
      if (this.isReady) {
        this.emit('end');
      }
    });
  }

  ready() {
    // ensure this can only be called once
    if (this.isReady === false) {
      this.isReady = true;
      //emit queued events
      this.parseAndEmit();
      if (this.ended) {
        this.emit('end');
      }
    }
  }

  parseAndEmit() {
    this.lines.forEach((line) => {
      this.emit('line', line);
    });
  }
}

function onStdErr(data) {
  this.stderr += data;
}

function onExit() {
  logger.verbose('cmd stream exited');
}

module.exports = CommandStream;
