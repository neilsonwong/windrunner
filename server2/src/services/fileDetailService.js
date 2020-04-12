'use strict';

const fs = require('fs').promises;

const BaseFile = require('../models/baseFile');
const fileUtil = require('../utils/fileUtil');
const logger = require('../logger');

async function getFastFileDetails(filePath) {
    const fileName = fileUtil.getFileName(filePath);
    const file = await getCachedFileDetails(filePath);
    if (file !== null) {
        return file;
    }
    const base = new BaseFile(fileName, filePath);
    return base;
}

async function getCachedFileDetails(filename) {
    // look for advanced details in database
    return null;
}

module.exports = {
    getFastFileDetails
};
