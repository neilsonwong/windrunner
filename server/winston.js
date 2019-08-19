'use strict';

const path = require('path');
const winston = require('winston');
const LOG_DIR = require('./config').LOG_DIR;

const loglevels = {
    levels: {
        error: 0, 
        warn: 1, 
        info: 2, 
        verbose: 3, 
        debug: 4, 
        trace : 5,
        silly: 6,
    },
    colors: {
        error: 'red', 
        warn: 'yellow', 
        info: 'cyan', 
        verbose: 'white', 
        debug: 'green', 
        trace : 'blue',
        silly: 'gray',
    }
};

function devFormat() {
    const formatMessage = info => `${info.level} ${info.message}`;
    const formatError = info => `${info.level} ${info.message}\n\n${info.stack}\n`;
    const format = info => info instanceof Error ? formatError(info) : formatMessage(info);
    return winston.format.printf(format);
}

const logger = winston.createLogger({
    levels: loglevels.levels,
    level: 'info',
    format: winston.format.combine(
        devFormat(),
        winston.format.colorize({all: true})
    ),
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log` 
        // - Write all logs error (and below) to `error.log`.
        //
        new winston.transports.File({ filename: path.join(LOG_DIR, 'error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(LOG_DIR, 'combined.log') })
    ]
});

winston.addColors(loglevels.colors);

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
// 
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
        level: process.env.NODE_LOGLEVEL || 'info',
    }));
}

// add log aliases
module.exports = logger;

// logging test
function test() {
    logger.error('test123');
    logger.warn('test123');
    logger.info('test123');
    logger.verbose('test123');
    logger.debug('test123');
    logger.trace ('test123');
    logger.silly('test123');
}
