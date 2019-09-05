'use strict';

const streamingMiddleware = function (req, res, next) {
  // inject functions into res to make things easier for to stream lol!
  res.stream = stream.bind(res);
  res.update = update.bind(res);
  next();
}

// stringify and write with newline appended
// store val as previousResponse
function stream(val) {
  const sVal = JSON.stringify(val);
  this.previousResponse = sVal;
  this.write(sVal + '\n');
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
