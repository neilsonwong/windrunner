'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const execFile = require('child_process').execFile;

const config = require('./config');

const inProgress = new Set([]);

//redundant function
//public folder either has thumbnail or doesn't
//function getThumbnail(file)

//commands used to gen the thumbnail
// ffmpeg -ss 00:05:00 -t 1 -i input_file -s 240x135 -f mjpeg output_file
// ffmpeg -i input_file -r 0.0033 -vf scale=-1:120 -vcodec png output_file

async function makeThumbnail(filePath, filename){
  if (inProgress.has(filePath)){
    console.log('already thumbnailing ' + filePath);
    return;
  }
  else {
    console.log('thumbnailing ' + filePath);
    //add to inProgress
    inProgress.add(filePath);

    //find filename
    let outputPath = path.join(config.THUMBNAIL_DIR, filename + '.jpg');

    console.log(filePath);
    console.log(outputPath);
    try {
      //gen the thumbnail
      let results = await generateThumbnail(filePath, outputPath);
      console.log(results);
    }
    catch(e){
      console.log('error');
      console.log(e);
    }

    console.log('thumbnailing ' + filePath + ' complete');
    inProgress.delete(filePath);
  }
}

function generateThumbnail(input, output){
  return new Promise((res, rej) => {
   let child = execFile('ffmpeg', ['-ss', '00:05:00', '-t', '1', '-i', input, '-s', '240x135', '-f', 'mjpeg', output], (error, stdout, stderr) => {
      if (error) {
        rej(stderr);  
      }
      res(stdout);
    });
  });
}

module.exports = {
  makeThumbnail: makeThumbnail
}