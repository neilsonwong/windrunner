'use strict';

const winston = require('../../winston');
const executor = require('./executor');

async function search(q) {
    const cmd = `find ${SHARE_PATH} -iname "*${q}*"`;
    try {
        return await executor.run(cmd);
    }
    catch (e) {
        winston.warn(`error occurred when running search for ${q}`);
        winston.warn(e);
        return [];
    }
}

async function fullListing(folder) {
    try {
        const allFiles = await executor.run('find',
            [folder, '-not', '-path', '*/\.*', '-type', 'f']);
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
    listAll: fullListing
}