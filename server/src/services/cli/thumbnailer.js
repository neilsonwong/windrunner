'use strict';

const executor = require('./executor');

/////////////////////////////////////////////////////////////////
// NOTE: THIS DOES NOT RETURN A VALUE, IT RETURNS THE PROMISE
// WE EXPECT A PROMISE.ALL TO WRAP MULTIPLE CALLS OF THIS
/////////////////////////////////////////////////////////////////

function generateThumbnail(filePath, outputPath, frameRipTime, urgent) {
  const cmd = 'ffmpeg';
  const args = ['-ss', frameRipTime, // set the time we want
    '-t', '1', '-i', filePath, '-s', '426x240', '-f', 'mjpeg', outputPath, 
    '-y', // say yes to overwrite
    '-loglevel', 'error' // hide all output except true errors since ffmpeg pipes stdout to stderr instead
  ];
  return urgent ? executor.rush(cmd, args) : executor.run(cmd, args);
}

module.exports = {
  generateThumbnail: generateThumbnail
};
