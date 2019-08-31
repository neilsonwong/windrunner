'use strict';

const express = require('express');
const { navigatorService } = require('../services/key');

const router1 = express.Router();
const router2 = express.Router();

router1.get('/ls/:path(*)?', async (req, res) => {
  const path = req.params.path || '';
  const files = await navigatorService.ls(path); 
  return res.json(files);
});

router1.get('/find', async (req, res) => {
  const q = req.query.q || '';
  const files = await navigatorService.find(q);
  return res.json(files);
});

router1.get('/fileNavRouter', (req, res) => {
  return res.send('i am not insane, fileNavRouter working!');
});

router2.get('/ls/:path(*)?', async (req, res) => {
  const path = req.params.path || '';

});

module.exports = {
  v1: router1,
  v2: router2
};
