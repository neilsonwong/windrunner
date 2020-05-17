'use strict';

// const restoreService = require('./src/services/dataGatherers/aniListRestoreService');
const { exec, execFile } = require('child_process');

function main() {
  // restoreService.getRestoreMappings();
  const folder = '/media/Seagate/anime/Seto no Hanayome';
  const days = 14;
  execFile('find',
    [folder, '-mindepth', '1', '-maxdepth', '1',
      '-not', '-path', `'*/.*'`,
      '-type', 'f',
      '-mtime', `-${days}`], 
      { maxBuffer: Infinity,/* shell: true */},
      (err, stdout, stderr) => {
        console.log(stdout);
      });
}

main();