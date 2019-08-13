'use strict';

const express = require('express');
const navigator = require('../services/navigatorService');

const router = express.Router();

router.get('/ls/:path(*)?', async (req, res) => {
    const path = req.params.path || '';
    const files = await navigator.ls(path); 
    res.send(JSON.stringify(files));
});

router.get('/find', async (req, res) => {
    const q = req.query.q || '';
    console.log(`attempting to find ${q}`);
    const files = await navigator.find(q);
    res.send(JSON.stringify(files));
});

router.get('/fileNavRouter', (req, res) => {
    res.send('i am not insane, fileNavRouter working!');
});

module.exports = router;