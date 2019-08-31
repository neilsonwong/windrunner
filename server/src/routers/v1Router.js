'use strict';

const express = require('express');

const fileNavRouter = require('./fileNavigationRouter').v1;
const thumbnailRouter = require('./thumbnailRouter').v1;
const userHabitsRouter = require('./userHabitsRouter').v1;

const router = express.Router();

router.use(fileNavRouter);
router.use(thumbnailRouter);
router.use(userHabitsRouter);

module.exports = router;
