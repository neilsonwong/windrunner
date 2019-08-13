'use strict';

const fs = require('fs').promises;
const winston = require('winston');

const File = require('../models/File');
const Folder = require('../models/Folder');
const Video = require('../models/Video');
const getVidLen = require('../services/videoMetadataService').duration;
const isVideo = new RegExp(/(\.(avi|mkv|ogm|mp4|flv|ogg|wmv|rm|mpeg|mpg)$)/);
const isPinned = require('../persistentData/pins').isPinned;

const fileLibraryDb = require('./levelDbService').instanceFor('fileLibrary');

async function analyze (file, forceRefresh) {
  let fileData;
  // get data from appropriate source
  if (forceRefresh) {
    fileData = await analyzeFromFs(file);
  }
  else {
    // grab from db
    fileData = await fileLibraryDb.get(file);

    // read from fs if not there
    if (fileData == undefined) {
      fileData = await analyzeFromFs(file);
    }
  }

  return fileData;
}

async function analyzeFromFs (file) {
  let data;
  try {
    const stats = await fs.stat(file);

    if (stats.isDirectory()) {
      let folder = new Folder(file, stats);
      folder.setPinned(isPinned(folder.path));
      data = folder;
    }
    else if (isVideo.test(file)) {
      let vidLen = await getVidLen(file);
      data = new Video(file, stats, vidLen);
    }
    else {
      data = new File(file, stats);
    }
  }
  catch (e) {
    data = new File(file, stats);
  }

  // update cache
  await fileLibraryDb.put(file, data);
  return data;
}

function analyzeFiles(filesArray) {
    const filePromiseArray = filesArray
        .filter(filename => (filename.length > 0)) 
        .filter(item => !(/(^|\/)\.[^\/\.]/g.test(item)))
        .map((fileName) => (analyze(fileName)));

    return Promise.all(filePromiseArray);
}

module.exports = {
	analyze: analyze,
	analyzeList: analyzeFiles,
};