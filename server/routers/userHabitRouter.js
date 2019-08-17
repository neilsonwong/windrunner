'use strict';

const express = require('express');
const winston = require('../winston');
const userConsumptionService = require('../services/userConsumptionService');

const router = express.Router();

router.get('/pins', async (req, res) => {
    let files = await userConsumptionService.getPinned();
    return res.json(files);
});

router.post('/pins/add', async (req, res) => {
    const pin = req.body;
    if (!pin) {
        return res.sendStatus(204);
    }
    else {
        const results = await userConsumptionService.addPin(pin);
        if (!results) {
            winston.error(`could not add pin ${pin}`);
        }
        return res.sendStatus(results ? 201 : 500);
    }
});

router.post('/pins/del', async (req, res) => {
    const pin = req.body;
    if (!pin){
        return res.sendStatus(204);
    }
    else {
        const results = await userConsumptionService.removePin(pin);
        if (!results) {
            winston.error(`could not del pin ${pin}`);
        }
        res.sendStatus(results ? 200 : 500);
    }
});

router.get('/userHabitRouter', (req, res) => {
    res.send('i am not insane, userHabitRouter working!');
});

module.exports = router;
