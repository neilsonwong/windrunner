'use strict';

const uuidv4 = require('uuid/v4');

class Command {
	constructor(cmd, args) {
		this.cmd = cmd;
		this.args = args;
		this.id = uuidv4();
	}
}

module.exports = Command;
