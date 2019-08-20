'use strict';

const express = require('express');
const { navigatorService } = require('../services/key');

const router = express.Router();

router.get('/ls/:path(*)?', async (req, res) => {
  const path = req.params.path || '';
  const files = await navigatorService.ls(path); 
  return res.json(files);
});

router.get('/find', async (req, res) => {
  const q = req.query.q || '';
  const files = await navigatorService.find(q);
  return res.json(files);
});

router.get('/fileNavRouter', (req, res) => {
  return res.send('i am not insane, fileNavRouter working!');
});

module.exports = router;
