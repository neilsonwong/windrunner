'use strict';

const fs = require('fs');
const config = require('./config');
const analyze = require('./fileOps').analyze;

let pinCache = undefined;

async function getPinList() {
  try {
    let pinned;
    if (pinCache === undefined){
      let pinData = await readPinned();
      pinned = JSON.parse(pinData);

      //update pinCache
      pinCache = pinned;
    }
    else {
      pinned = pinCache;
    }

    return pinned;
  }
  catch (e) {
    console.log("Error retrieving pinned files");
    return [];
  }
}

async function addPin(newPin) {
  let pinIndex = pinCache.indexOf(newPin);
  if (pinIndex !== -1){
    return false;
  }
  else {
    //add the new pin
    pinCache.push(newPin);
    await writePinned();
    return true;
  }
}

async function removePin(deadPin) {
  let pinIndex = pinCache.indexOf(deadPin);
  if (pinIndex !== -1){
    pinCache.splice(pinIndex, 1);
    await writePinned();
    return true;
  }
  else {
    return false;
  }
}

function readPinned(){
  return new Promise((res, rej) => {
    fs.readFile(config.PIN_FILE, (err, data) => {
      if (err) {
        rej(err);
      }
      res(data);
    });
  });
}

function writePinned(){
  return new Promise((res, rej) => {
    fs.writeFile(config.PIN_FILE, JSON.stringify(pinCache), 'utf8', (err) => {
      if (err) {
        rej(err);
      }
      else {
        res();
      }
    });
  });
}

function isPinned(path){
  if (pinCache === undefined) {
    return false;
  }
  return (pinCache.indexOf(path) > -1);
}

async function init(){
  await getPinList();
  console.log('pins are loaded');
}

init();

module.exports = {
  get: getPinList,
  add: addPin,
  del: removePin,
  isPinned: isPinned
};