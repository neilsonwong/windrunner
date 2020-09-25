const Readable = require('stream').Readable;
const CustomStreamTransport = require('../logging/customStreamTransport');
const logger = require('../logger');
const executor = require('./cli/executor');

function streamLogsToBody(ctx) {
  const s = getNewStream();
  const tempStreamTransport = new CustomStreamTransport(s, { level: 'debug' });
  logger.add(tempStreamTransport);
  ctx.body = s;
  ctx.req.on('close', () => {
    logger.remove(tempStreamTransport);
  });
}

function streamLoadToBody(ctx) {
  const s = getNewStream();
  const temp = setInterval(() => {
    s.push(JSON.stringify(executor.health()));
    s.push('\n');
  }, 1000);
  ctx.body = s;
  ctx.req.on('close', () => {
    clearInterval(temp);
  });
}

function getNewStream() {
  return new Readable({
    read(size) {
      return true;
    }
  });
}

module.exports = {
  streamLogsToBody: streamLogsToBody,
  streamLoadToBody: streamLoadToBody
}