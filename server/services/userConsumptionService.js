'use strict';
const winston = require('../winston');
const levelDb = require('./levelDbService')
const watchHistory = levelDb.instanceFor('watchHistory');
const pinDb = levelDb.instanceFor('pins');

async function getPinned() {
    const pinList = await pinDb.all();
    return (pinList === undefined) ? [] : Object.keys(pinList);
}

async function isPinned(folder) {
    const pinned = await pinDb.get(folder);
    return (pinned !== undefined);
}

async function addPin(pin) {
    return await pinDb.put(pin, Date.now());
}

async function removePin(pin) {
    return await pinDb.del(pin);
}

async function getWatchTime(file) {
    const time = await watchHistory.get(file);
    winston.silly(time);
    return time === undefined ? 0 : time;
}

async function updateWatchTime(file, time) {
    const current = await getWatchTime(file);
    const updated = await watchHistory.put(file, current + time);
    if (updated === false) {
        winston.error(`there was an error updating the watch time for ${file}`);
    }
}

async function resetWatchTime(file) {
    return await watchHistory.del(file);
}

async function setWatchTime(file, time) {
    return await watchHistory.put(file, time);
}

module.exports = {
    getPinned: getPinned,
    isPinned: isPinned,
    addPin: addPin,
    removePin: removePin,
    getWatchTime: getWatchTime,
    updateWatchTime: updateWatchTime,
}

async function testPins() {
    for (let i = 0; i < 5; ++i) {
        await addPin(`test${i}`);
        const result = await isPinned(`test${i}`);
        console.log(`test${i} is ${result ? '' : 'not'} pinned`);
    }

    const bo = await getPinned();
    console.log(JSON.stringify(bo));
}

async function testWatchHistory() {
    await watchHistory.del('testFile');
    let watched = await getWatchTime('testFile');
    await updateWatchTime('testFile', 2);
    let watched2 = await getWatchTime('testFile');
}

async function main() {
    await testPins();
    await testWatchHistory();
}

main();