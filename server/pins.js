'use strict';

const config = require('./config');
const FileCache = require('./fileCache');
const analyze = require('./fileOps').analyze;

async function getPinList() {
  return FileCache.get("pins");
}

async function addPin(newPin) {
  let pinCache = FileCache.get("pins");
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
  let pinCache = FileCache.get("pins");
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
  let pinCache = FileCache.get("pins");
  if (pinCache === undefined) {
    return false;
  }
  return (pinCache.indexOf(path) > -1);
}

async function init(){
  await FileCache.loadCache("pins");
}

init();

module.exports = {
  get: getPinList,
  add: addPin,
  del: removePin,
  isPinned: isPinned
};
