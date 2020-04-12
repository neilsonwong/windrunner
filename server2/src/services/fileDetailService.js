'use strict';

const fs = require('fs').promises;

const fileUtil = require('../utils/fileUtil');
const logger = require('../logger');

async function getFastFileDetails(filePath) {
    const fileName = fileUtil.getFileName(filePath);
    const file = await getCachedFileDetails(filePath);
    if (file !== null) {
        return file;
    }
    return new BaseFile(fileName, filePath);
}

async function getCachedFileDetails(filename) {
    // look for advanced details in database
    return null;
}

module.exports = {
    getFastFileDetails
};
