'use strict';

const v1 = require('./v1Router');
const v2 = require('./v2Router');

module.exports = {
    api: {
        v1: v1,
        v2: v2
    }
};
