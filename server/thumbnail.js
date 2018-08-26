'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const execFile = require('child_process').execFile;

const config = require('./config');

const inProgress = new Set([]);
const waiting = [];

//redundant function
//public folder either has thumbnail or doesn't
//function getThumbnail(file)

//commands used to gen the thumbnail
// ffmpeg -ss 00:05:00 -t 1 -i input_file -s 240x135 -f mjpeg output_file
// ffmpeg -i input_file -r 0.0033 -vf scale=-1:120 -vcodec png output_file
function addToThumbnailQueue(filePath, filename){
  let imgPath = path.join(config.THUMBNAIL_DIR, filename + '.jpg');

  fs.access(imgPath, fs.constants.R_OK, (err) => {
    if (!err){
      console.log(`image has already been generated: %{imgPath}`);
    }
    else {
      //add to queue
      console.log(`pushed ${filePath} onto waiting`);
      waiting.push(filePath);
      makeThumbnail();
    }
  });
}

async function makeThumbnail(){
  //check if we have workers open
  // console.log(`inprogress: ${inProgress.size}`)
  if (inProgress.size > config.THUMBNAIL_WORKERS){
    console.log('too many workers');
    return;
  }
  else if (waiting.length === 0){
    console.log('no more work atm');
    return;
  }

  let filePath = waiting.pop();

  if (inProgress.has(filePath)){
    console.log('already thumbnailing ' + filePath);
    return;
  }
  else {
    //grab the first entry off the set
    console.log('thumbnailing ' + filePath);
    //add to inProgress
    inProgress.add(filePath);

    let filename = path.basename(filePath);

    //find filename
    let outputPath = path.join(config.THUMBNAIL_DIR, filename + '.jpg');

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
    makeThumbnail();
  }
}

function generateThumbnail(input, output){
  return new Promise((res, rej) => {
   let child = execFile('ffmpeg', ['-ss', '00:05:00', '-t', '1', '-i', input, '-s', '320x180', '-f', 'mjpeg', output], (error, stdout, stderr) => {
      if (error) {
        rej(stderr);  
      }
      res(stdout);
    });
  });
}

module.exports = {
  makeThumbnail: makeThumbnail,
  addToThumbnailQueue, addToThumbnailQueue
};