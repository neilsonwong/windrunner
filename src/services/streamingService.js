'use strict';

const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const logger = require('../logger');
const executor = require('./cli/executor');
const fileCache = require('./data/fileCache');
const config = require('../../config.json');

function transcodeVideo(fileId, filePath) {
  logger.info(`transcoding ${filePath}`);
  // transcoding to webm is TOO time consuming, and my low power server is not strong enough to do it
  // at a reasonable rate
  // ffmpeg -i "[HorribleSubs] Shirobako - 01 [1080p].mkv" -vcodec libvpx-vp9 -crf 31 -b:v 0 -cpu-used 1 -row-mt 1 -deadline realtime shirobako1_v9_rt.webm
  // ffmpeg -i "[HorribleSubs] Kanojo, Okarishimasu - 01 [1080p].mkv" -vcodec libvpx-vp9 -crf 31 -b:v 0 -row-mt 1 -deadline realtime -cpu-used 5 kano_v9_4.webm
  // instead, we'll stream the direct h264 stream after switching to an mp4 container
  // ffmpeg -i "[HorribleSubs] Shirobako - 01 [1080p].mkv" -movflags faststart -c copy shirobako_1.mp4
  const cmd = 'ffmpeg';
  const outFile = getTranscodedPath(fileId);
  const args = ['-i', filePath, 
    '-movflags', 'faststart',
    '-c', 'copy',
    outFile,    
    '-y', // say yes to overwrite
    '-loglevel', 'error' // hide all output except true errors since ffmpeg pipes stdout to stderr instead
  ];
  logger.info(`${cmd} ${args.join(' ')}`);
  return executor.run(cmd, args);
}

function ripSubtitles(fileId, filePath) {
  // ffmpeg -i '[HorribleSubs] Kanojo, Okarishimasu - 01 [1080p].mkv' kano.vtt
  const cmd = 'ffmpeg';
  const outFile = getSubtitlePath(fileId);
  const args = ['-i', filePath, 
    outFile,    
    '-y', // say yes to overwrite
    '-loglevel', 'error' // hide all output except true errors since ffmpeg pipes stdout to stderr instead
  ];
  return executor.run(cmd, args);
}

async function getTranscoded(fileId) {
  const transcodedPath = getTranscodedPath(fileId);
  // try to find the transcoded
  try {
    const stats = await fs.stat(transcodedPath);
    if (stats !== null && stats !== undefined) {
      return {
        filePath: transcodedPath,
        fileSize: stats.size
      }
    }
  }
  catch (e) {
    // if it's not there, transcode it now!
    logger.info(`could not find ${transcodedPath}, need to transcode!`);
    const sourceFile = await fileCache.getPathFromId(fileId);
    await transcodeVideo(fileId, sourceFile);
    return await getTranscoded(fileId);
  }
}

async function getSubtitle(fileId) {
  const subPath = getSubtitlePath(fileId);
  try {
    const stats = await fs.stat(subPath);
    if (stats !== null && stats !== undefined) {
      return subPath;
    }
  }
  catch (e) {
    // if it's not there, transcode it now!
    logger.info(`could not find ${subPath}, need to rip subs!`);
    const sourceFile = await fileCache.getPathFromId(fileId);
    await ripSubtitles(fileId, sourceFile);
    return await getSubtitle(fileId);
  }
}

function getSubtitlePath(fileId) {
  return path.join(config.TRANSCODE_DIR, `${fileId}.vtt`);
}

function getTranscodedPath(fileId) {
  return path.join(config.TRANSCODE_DIR, `${fileId}.mp4`);
}

module.exports = {
  getTranscoded,
  getSubtitle,
};
