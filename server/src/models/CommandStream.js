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
    spawned.stderr.on('data', (data) => {
      this.stderr += data;
    });
    spawned.on('exit', () => {
      this.ended = true;
      if (this.isReady) {
        this.emit('end');
      }
    });
  }

  // returns a promise for when the stream ends
  ready(onLine) {
    return new Promise((res, rej) => {
      // ensure this can only be called once
      if (this.isReady === false) {
        this.isReady = true;

        // attach event handlers
        this.on('line', onLine);
        this.on('end', () => {
          logger.verbose('cmd stream exited');
          return (this.stderr) ? rej(stderr) : res();
        });

        // emit queued events
        this.parseAndEmit();

        // if this is already ended
        if (this.ended) {
          this.emit('end');
        }
      }
      else {
        return rej('ready was called more than once!!!');
      }
    });
  }

  parseAndEmit() {
    this.lines.forEach((line) => {
      this.emit('line', line);
    });
  }
}

module.exports = CommandStream;
