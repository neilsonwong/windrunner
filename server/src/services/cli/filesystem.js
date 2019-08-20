'use strict';

////////////////////////////////////////////////////////////////
//
// DEPRECATED: DO NOT USE
// FOR DEV PURPOSES USE THE REMOTE SERVICES TO CONNECT TO THE SAMBA
//
////////////////////////////////////////////////////////////////

const fs = require('fs').promises;
const executor = require('./executor');
const config = require('@config');
const winston = require('@app/logger');

function RemoteCliFs () {}

// match the fs.promises api and return promises / async functions
// return promises
RemoteCliFs.stat = async function(file) {
  const cmd = 'stat';
  const args = ['-c', '%s %Z %F', file];
  try {
    const statString = await executor.run(cmd, args);
    const statObj = newStat(statString);
    if (statObj === null) {
      throw Error('could not parse returned stat');
    }
    return statObj;
  }
  catch (e) {
    winston.warn(`error occured running stat on file ${file}`);
    console.log(cmd);
    console.log(e);
    winston.warn(e);
  }
  return null;
};

// i COULD use the find function from fileList service here
// but a separate fs implementation is the proper way
RemoteCliFs.readdir = async function(dirPath) {
  const cmd = 'ls';
  const args = ['-1', dirPath];
  try {
    const fileNames = await executor.run(cmd, args);
    return fileNames.split('\n');
  }
  catch (e) {
    winston.warn(`error occured reading contents for folder ${dirPath}`);
    winston.warn(e);
    console.log(e);
  }
  return [];
};

RemoteCliFs.mkdir = async function(folder, options) {
  const recursive = (options && options.recursive);
  const cmd = 'mkdir';
  const args = recursive ? ['-p', folder] : [folder];
  try {
    await executor.run(cmd, args);
    return true;
  }
  catch (e) {
    winston.warn(`error occured creating folder ${folder}`);
    winston.warn(e);
    console.log(e);
  }
  return false;
};

const statRegExp = new RegExp('^([0-9]+)[\\s]([0-9]+)[\\s]([a-zA-Z ]+)[\\s]*$');
function newStat(statString) {
  //i'm a cheater, i only use these vals, so i'll only send these
  // birthTime = cTime but in seconds, i multiply by 1000, close enough lol

  const match = statRegExp.exec(statString);
  if (match) {
    try {
      const size = parseInt(match[1]);
      const birth = parseInt(`${match[2]}000`);
      const isDir = match[3] === 'directory';
      return {
        size: size,
        birthtime: birth,
        isDirectory: (() => (isDir))
      };
    }
    catch(e) {
      winston.warn('error occured when parsing stat string');
      winston.warn(e);
      console.log(statString);
      console.log(e);
    }
  }
  return null;
}

// module.exports = RemoteCliFs;
module.exports = (config.REMOTE_HOST) ? RemoteCliFs : fs;