'use strict';

const fs = require('fs').promises;
const path = require('path');

const logger = require('../logger');
const { SHARE_PATH } = require('../../config.json');
const fileDetailService = require('./fileDetailService');
const fileUtil = require('../utils/fileUtil');

async function listDirectory(dir) {
    if (!dir) {
        logger.error('attempt to list empty or null directory');
        return [];
    }

    try {
        const pathOnServer = fileUtil.pathOnServer(dir);
        const files = await fs.promises.readdir(pathOnServer);
        if (files && files.length > 0) {
            return files.map(file => {
                const filePath = fileUtil.pathOnServer(file);
                return fileDetailService.getFastFileDetails(filePath);
            });
        }
        else {
            logger.verbose(`empty directory: ${dir}`);
        }
    }
    catch (e) {
        logger.error('error occurred when listing directory');
        logger.error(e);
    }
    return [];
}

module.exports = {
    listDirectory
};
