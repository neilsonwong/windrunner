'use strict';

const config = require('../../../config');
const { mountRemoteSamba } = require('../cli/mount');

async function init() {
  if (config.REMOTE_HOST) {
    await mountRemoteSamba();
  }
}

module.exports = {
  init: init
};