'use strict';

const uuidv4 = require('uuid/v4');

class Command {
	constructor(cmdString) {
		this.cmdString = cmdString;
		this.id = uuidv4();
	}
}

module.exports = Command;
