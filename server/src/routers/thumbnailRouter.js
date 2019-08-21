'use strict';

const express = require('express');
const logger = require('../logger');
const { thumbnailService } = require('../services/key');

const router = express.Router();

router.get('/thumblist/:fileName', async (req, res) => {
  const fileName = req.params.fileName;
  const thumbList = await thumbnailService.getThumbnailList(fileName);
  return res.json(thumbList);
});

router.get('/thumb/:fileName/:imgFile', async (req, res) => {
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

router.get('/thumbnailRouter', (req, res) => {
  return res.send('i am not insane, thumbnailRouter working!');
});

module.exports = router;
