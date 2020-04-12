'use strict';

const path = require('path');
const { SHARE_PATH } = require('../../config.json');

function getFileName(filePath) {
    return path.basename(filePath);
}

// expects a filepath, and prepends the server path
function pathOnServer(filePath) {
    return filePath.startsWith(SHARE_PATH) ?
        filePath :
        path.join(SHARE_PATH, filePath);
}

module.exports = {
    getFileName,
    pathOnServer
};
