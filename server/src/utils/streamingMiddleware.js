'use strict';
// very useful
// https://gist.github.com/CMCDragonkai/6bfade6431e9ffb7fe88

const CHUNK_END = '\r\n';

const streamingMiddleware = function (req, res, next) {
  // inject functions into res to make things easier for to stream lol!
  res.initStream = sendFirstChunk.bind(res);
  res.stream = stream.bind(res);
  res.update = update.bind(res);
  next();
}

// stringify and write with newline appended
// store val as previousResponse
function stream(val) {
  if (this.previousResponse === undefined) {
    this.initStream();
  }
  const sVal = JSON.stringify(val);
  this.previousResponse = sVal;
  this.write(sVal + CHUNK_END);
}

function sendFirstChunk() {
  this.write(Array(1024).join(CHUNK_END));
}

// stringify and compare with old response
// if it is the same, no need to send a new response
function update(obj) {
  const sObj = JSON.stringify(obj);
  if (sObj !== this.previousResponse) {
    this.stream(obj);
  }
}

module.exports = streamingMiddleware;
