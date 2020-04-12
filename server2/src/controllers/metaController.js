'use strict';

const config = require('../../config.json');

function hello(ctx) {
    ctx.body = 'Sylvanas says hello';
}

function getServerInfo(ctx) {
    ctx.body = {
        version: config.API_VERSION,
        apiPrefix: `/api/v${config.API_VERSION}/`,
        port: config.API_PORT
    };
}

module.exports = {
    hello,
    getServerInfo
};
