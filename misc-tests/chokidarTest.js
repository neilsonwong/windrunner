'use strict';

const chokidar = require('chokidar');

const watcher = chokidar.watch('/media/Seagate', {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  ignoreInitial: true,
  persistent: true,
  awaitWriteFinish: true
});

watcher
  .on('ready', () => console.log('Initial scan complete. Ready for changes'))
  .on('add', path => console.log(`File ${path} has been added`))
  .on('addDir', path => console.log(`File ${path} has been added`))