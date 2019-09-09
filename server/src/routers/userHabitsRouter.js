'use strict';

const express = require('express');
const logger = require('../logger');
const { userConsumptionService } = require('../services/key');

const router = express.Router();

router.get('/pins', async (req, res) => {
  const files = await userConsumptionService.getPinned();
  return res.json(files);
});

router.post('/pins/add', async (req, res) => {
  const pin = req.body;
  if (!pin) {
    return res.sendStatus(400);
  }
  else {
    const results = await userConsumptionService.addPin(pin);
    if (!results) {
      logger.error(`could not add pin ${pin}`);
    }
    console.log(results);
    return results ? res.status(201).send(pin) : res.sendStatus(500);
  }
});

router.post('/pins/del', async (req, res) => {
  const pin = req.body;
  if (!pin){
    return res.sendStatus(400);
  }
  else {
    const results = await userConsumptionService.delPin(pin);
    if (!results) {
      logger.error(`could not del pin ${pin}`);
    }
    console.log(results);
    return results ? res.status(200).send(pin) : res.sendStatus(500);
  }
});

router.post('/watch', async(req, res) => {
  const fileId = req.body;
  if (!fileId) {
    return res.sendStatus(400);
  }
  else {
    // trigger smb service watch
  }
});

router.get('/userHabitRouter', (req, res) => {
  res.send('i am not insane, userHabitRouter working!');
});

module.exports = {
  v1: router,
  v2: router
};
