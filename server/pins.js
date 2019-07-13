'use strict';

const config = require('./config');
const FileCache = require('./fileCache');
const analyze = require('./fileOps').analyze;

let pinCache = undefined;

async function getPinList() {
  try {
    let pinned;
    if (pinCache === undefined){
      pinCache = await FileCache.get("pins");
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
    await FileCache.set("pins", pinCache);
    return true;
  }
}

async function removePin(deadPin) {
  let pinIndex = pinCache.indexOf(deadPin);
  if (pinIndex !== -1){
    pinCache.splice(pinIndex, 1);
    await FileCache.set("pins", pinCache);
    return true;
  }
  else {
    return false;
  }
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