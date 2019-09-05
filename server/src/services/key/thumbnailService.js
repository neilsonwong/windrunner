'use strict';

const thumbnailer = require('../helper/thumbnailGenerationService');
const fileLibrary = require('../helper/fileLibraryService');
const { FileType } = require('../../models');

const pendingThumbnails = new Map();

async function makeThumbnails(fileId) {
  const fileObj = await fileLibrary.getById(fileId);
  if (fileObj.type === FileType.VIDEO) {
    if (pendingThumbnails.has(fileId) === false) {
      // fire it off, but don't wait for it to finish
      // store our promise in a map so other can subscribe to it
      const thumbnailPromises = await thumbnailer.makeThumbnails(fileId);
      const allThumbsDone = thumbnailPromises[1];
      allThumbsDone.then(removeFromPending.bind(null, fileId));

      pendingThumbnails.set(fileId, thumbnailPromises);
      return thumbnailPromises;
    }
    else {
      return pendingThumbnails.get(fileId);
    }
  }
  return false;
}

function getThumbnailList(fileId) {
  return thumbnailer.getThumbnailList(fileId);
}

function getThumbnailPath(fileId, imgPath) {
  return thumbnailer.getThumbnailPath(fileId, imgPath);
}

async function getThumbnailFromFilename(fileName) {
  const fileObj = await fileLibrary.get(fileName);
  if (fileObj && fileObj.id) {
    const fileId = fileObj.id;
    const thumbList = await thumbnailService.getThumbnailList(fileId);
    if (thumbList.length === 0) {
      logger.error(`no thumbnails made for ${fileName}`);
      return res.send("OK");
    }

    const fullImgPath = await thumbnailService.getThumbnailPath(fileName, imgPath);
    
    // the files SHOULD exist, so we should know when it's not there
    if (fullImgPath !== null) {
      return fullImgPath;
    }
  }

  logger.error(`couldn't find thumbnail using filename for ${fileName}`);
  return null;
}

function removeFromPending(fileId) {
  if (pendingThumbnails.has(fileId)) {
    pendingThumbnails.delete(fileId);
  }
  else {
    logger.error(`there was an attempt to remove ${fileId} from the pending thumbnails Map, but it doesn't exist`);
  }
}

module.exports = {
  makeThumbnails: makeThumbnails,
  getThumbnailList: getThumbnailList,
  getThumbnailPath: getThumbnailPath,
  getThumbnailFromFilename: getThumbnailFromFilename,
};