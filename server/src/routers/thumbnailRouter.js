'use strict';

const express = require('express');
const logger = require('../logger');
const { thumbnailService } = require('../services/key');

const router1 = express.Router();
const router2 = express.Router();

// OLD FUNCTION FOR LEGACY PURPOSES
router1.get('/thumb/:filePath', async (req, res) => {
  const fileName = path.basename(req.params.filePath);
  const thumbList = await thumbnailService.getThumbnailList(fileName);
  if (thumbList.length === 0) {
    logger.error(`no thumbnails made for ${fileName}`);
    return res.send("OK");
  }

  const imgFile = thumbList[0];
  const fullImgPath = await thumbnailService.getThumbnailPath(fileName, imgPath);
  
  // the files SHOULD exist, so we should know when it's not there
  if (fullImgPath !== null) {
    return res.sendFile(fullImgPath);
  }
  else {
    logger.error(`couldn't find thumbnail for ${fileName} ${imgFile}`);
    // in the old api we send OK and not an error or 404
    return res.send("OK");
  }
});

router2.get('/thumblist/:fileName', async (req, res) => {
  const fileName = req.params.fileName;
  const thumbList = await thumbnailService.getThumbnailList(fileName);
  return res.json(thumbList);
});

router2.get('/thumb/:fileName/:imgFile', async (req, res) => {
  const fileName = req.params.fileName;
  const imgFile = req.params.imgFile;
  const fullImgPath = await thumbnailService.getThumbnailPath(fileName, imgFile);

  // the files SHOULD exist, so we should know when it's not there
  if (fullImgPath !== null) {
    return res.sendFile(fullImgPath);
  }
  else {
    logger.error(`couldn't find thumbnail for ${fileName} ${imgFile}`);
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
