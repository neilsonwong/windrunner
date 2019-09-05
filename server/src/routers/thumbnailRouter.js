'use strict';

const express = require('express');
const logger = require('../logger');
const { thumbnailService } = require('../services/key');
const streamingMiddleware = require('../utils/streamingMiddleware');

const router1 = express.Router();
const router2 = express.Router();
router2.use(streamingMiddleware);

// OLD FUNCTION FOR LEGACY PURPOSES
router1.get('/thumb/:filePath', async (req, res) => {
  const fileName = path.basename(req.params.filePath);
  const fullImgPath = await thumbnailService.getThumbnailFromFilename(fileName);

  // the files SHOULD exist, so we should know when it's not there
  if (fullImgPath !== null) {
    return res.sendFile(fullImgPath);
  }
  else {
    return res.send("OK");
  }
});

router2.get('/thumblist/:fileId', async (req, res) => {
  const fileId = req.params.fileId;
  const thumbList = await thumbnailService.getThumbnailList(fileId);
  res.stream(thumbList);
  if (thumbList.length === 0) {
    const thumbnailPromises = await thumbnailService.makeThumbnails(fileId);
    if (thumbnailPromises !== false) {
      const firstThumbnailDone = thumbnailPromises[0];
      const allThumbnailsDone = thumbnailPromises[1];

      await firstThumbnailDone;
      res.update(await thumbnailService.getThumbnailList(fileId));

      await allThumbnailsDone;
      res.update(await thumbnailService.getThumbnailList(fileId));
    }
    else {
      logger.warning('attempt to generate thumbnail for file that is not a video');
      return res.sendStatus(500);
    }
  }
  return res.end();
});

router2.get('/thumb/:fileId/:imgFile', async (req, res) => {
  const fileId = req.params.fileId;
  const imgFile = req.params.imgFile;
  const fullImgPath = await thumbnailService.getThumbnailPath(fileId, imgFile);

  // the files SHOULD exist, so we should know when it's not there
  if (fullImgPath !== null) {
    return res.sendFile(fullImgPath);
  }
  else {
    logger.error(`couldn't find thumbnail for ${fileId} ${imgFile}`);
    return res.sendStatus(404);
  }
});

router2.get('/thumbnailRouter', (req, res) => {
  return res.send('i am not insane, thumbnailRouter working!');
});

module.exports = {
  v1: router1,
  v2: router2
};
