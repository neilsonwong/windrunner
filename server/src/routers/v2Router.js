'use strict';

const express = require('express');

const fileNavRouter = require('./fileNavigationRouter').v2;
const thumbnailRouter = require('./thumbnailRouter').v2;
const userHabitsRouter = require('./userHabitsRouter').v2;

const router = express.Router();

router.use(fileNavRouter);
router.use(thumbnailRouter);
router.use(userHabitsRouter);

module.exports = router;
