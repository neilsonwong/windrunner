'use strict';

const fs = require('fs');
const logger = require('../logger');
const koaSend = require('koa-send');

const streamingService = require('../services/streamingService');

async function getSubtitle(ctx) {
  if (ctx.params.fileId === undefined || ctx.params.fileId === null ) {
    return ctx.throw(400, 'fileId required for subtitles!');
  }
  const fileId = decodeURIComponent(ctx.params.fileId);
  const subtitlePath = await streamingService.getSubtitle(fileId);
  await koaSend(ctx, subtitlePath);
}

async function getStream(ctx) {
  if (ctx.params.fileId === undefined || ctx.params.fileId === null ) {
    return ctx.throw(400, 'fileId required to stream!');
  }
  else if (!ctx.state.range) {
    return;
  }
  else {
    const fileId = decodeURIComponent(ctx.params.fileId);
    const { filePath, fileSize } = await streamingService.getTranscoded(fileId);
    const range = setStreamingContext(ctx, fileSize);
    const stream = fs.createReadStream(filePath, range);
    ctx.body = stream;
    ctx.req.on('close', () => {
      stream.destroy();
    });
  }
}

function setStreamingContext(ctx, fileSize) {
  const start = ctx.state.range.start;
  const end = ctx.state.range.end === Infinity ?
    fileSize - 1:
    ctx.state.range.end;

  ctx.status = 206
  ctx.set('Content-Type', 'video/mp4');
  ctx.set('Accept-Ranges', 'bytes');
  ctx.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
  ctx.set('Content-Length', end - start + 1);
  return { start, end };
}

module.exports = {
  getSubtitle,
  getStream,
};
