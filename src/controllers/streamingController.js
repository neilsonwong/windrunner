'use strict';

const fs = require('fs');
const logger = require('../logger');
const koaSend = require('koa-send');

const streamingService = require('../services/streamingService');

async function getSubtitle(ctx) {
  if (ctx.params.fileId === undefined) {
    return ctx.throw(400, 'fileId required for subtitles!');
  }
  const fileId = decodeURIComponent(ctx.params.fileId);
  const subtitlePath = await streamingService.getSubtitle(fileId);
  await koaSend(ctx, subtitlePath);
}

async function getStream(ctx) {
  if (ctx.params.fileId === undefined) {
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

async function testSub(ctx) {
  ctx.params.fileId = encodeURIComponent('9839a93e-90b4-43f2-b36f-aa8b364f2f1a');
  await getSubtitle(ctx);
  // await koaSend(ctx, 'public/kano.vtt');
}

async function testStream(ctx) {
  // ctx.params.fileId = encodeURIComponent('d039b097-b721-404f-bcb2-2f521dbfa768');
  ctx.params.fileId = encodeURIComponent('9839a93e-90b4-43f2-b36f-aa8b364f2f1a');
  await getStream(ctx);

  // let range = ctx.header.range
  // if (!range) {
  //   return
  // }
  // const ranges = rangeParse(range)
  // let [start, end] = ranges[0]
  // let start = ctx.state.range.start;
  // let end = ctx.state.range.end;

  // const path = '/mnt/c/Users/Neilson/Desktop/kano_sf.mp4'
  // const stats = await fs.promises.lstat(path)
  // const fileSize = stats.size
  // ctx.status = 206
  // ctx.set('Content-Type', 'video/mp4')
  // ctx.set('Accept-Ranges', 'bytes')
  // end = end === Infinity ? fileSize - 1 : end
  // ctx.set('Content-Range', `bytes ${start}-${end}/${fileSize}`)
  // ctx.set('Content-Length', end - start + 1)

  // logger.info(start);
  // logger.info(end);
  // ctx.body = fs.createReadStream(path, { start, end })
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

async function testPage(ctx) {
  await koaSend(ctx, 'public/stream.html');
}

module.exports = {
  getSubtitle,
  getStream,
  testStream,
  testSub,
  testPage
};
