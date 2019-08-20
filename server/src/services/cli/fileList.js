'use strict';

const winston = require('../../logger');
const config = require('../../../config');
const executor = require('./executor');

async function search(q) {
  const cmd = 'find';
  const args = [config.SHARE_PATH, '-iname', `*${q}*`];
  try {
    const results = await executor.run(cmd, args);
    if (results) {
      return results.split('\n');
    }
  }
  catch (e) {
    winston.warn(`error occurred when running search for ${q}`);
    winston.warn(e);
  }
  return [];
}

async function list(d) {
  const cmd = `ls -d "${d}"/*`;
  try {
    const results = await executor.run(cmd);
    if (results) {
      return results.split('\n');
    }
  }
  catch (e) {
    winston.warn(`error occurred when running search for ${d}`);
    winston.warn(e);
  }
  return [];
}

async function fullListing(folder) {
  try {
    const allFiles = await executor.run('find',
      [folder, '-not', '-path', '*/.*', '-type', 'f']);
    return allFiles;
  }
  catch(e) {
    winston.warn(`there was an error full Listing ${folder}`);
    winston.warn(e);
    return ''; 
  }
}


module.exports = {
  search: search,
  list: list,
  listAll: fullListing
};
