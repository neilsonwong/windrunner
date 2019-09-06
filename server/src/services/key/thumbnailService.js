'use strict';

const thumbnailer = require('../helper/thumbnailGenerationService');
const fileLibrary = require('../helper/fileLibraryService');
const { FileType } = require('../../models');

async function makeThumbnails(fileId) {
  const fileObj = await fileLibrary.getById(fileId);
  return (fileObj.type === FileType.VIDEO) ?
    await thumbnailer.makeThumbnails(fileId) :
    false;
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
      return null;
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