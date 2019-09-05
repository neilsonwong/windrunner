'use strict';

const express = require('express');
const streamingMiddleware = require('../utils/streamingMiddleware');
const { navigatorService } = require('../services/key');

const router1 = express.Router();
const router2 = express.Router();
router2.use(streamingMiddleware);

router1.get('/ls/:path(*)?', async (req, res) => {
  const path = req.params.path || '';
  return res.json(await navigatorService.ls(path));
});

router1.get('/find', async (req, res) => {
  const q = req.query.q || '';
  return res.json(await navigatorService.find(q));
});

router1.get('/recent', async (req, res) => {
  return res.json(await navigatorService.recent());
});

router1.get('/fileNavRouter', (req, res) => {
  return res.send('i am not insane, fileNavRouter working!');
});

router2.get('/recent', async (req, res) => {
  res.stream(navigatorService.getOldRecent());
  res.update(await navigatorService.recent());
  return res.end();
});

router2.get('/ls/:path(*)?', async (req, res) => {
  const path = req.params.path || '';

});

module.exports = {
  v1: router1,
  v2: router2
};
