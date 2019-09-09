'use strict';

const pinDb = require('./levelDbService').instanceFor('pins');

async function getPinned() {
  const pinList = await pinDb.all();
  const pinNameArray = (pinList === undefined) ? [] : 
    Object.keys(pinList).map((pinKey) => (pinKey.substr(5)));
  return pinNameArray;
}

async function isPinned(folder) {
  const pinned = await pinDb.get(folder);
  return (pinned !== undefined);
}

async function addPin(pin) {
  return await pinDb.put(pin, Date.now());
}

async function delPin(pin) {
  return await pinDb.del(pin);
}

module.exports = {
  getPinned: getPinned,
  isPinned: isPinned,
  addPin: addPin,
  delPin: delPin,
};

/*
async function testPins() {
  for (let i = 0; i < 5; ++i) {
    await addPin(`test${i}`);
    const result = await isPinned(`test${i}`);
    console.log(`test${i} is ${result ? '' : 'not'} pinned`);
  }

  const bo = await getPinned();
  console.log(JSON.stringify(bo));
}
*/