'use strict';

const { v4: uuidv4 } = require('uuid');

class Command {
  constructor(cmd, args, opts) {
    this.id = uuidv4();
    this.cmd = cmd;
    this.args = args;
    this.opts = opts;
  }

  toStringCmd() {
    // add doublequotes for spaces
    if (this.args) {
      let joinedArgs = this.args.map(e => {
        let fixed = e;
        // TODO: can change to a regex in the future
        if ((fixed.indexOf(' ') !== -1) ||
				// (fixed.indexOf('*') !== -1) ||
				(fixed.indexOf('$') !== -1) ||
				(fixed.indexOf('?') !== -1)) {
          fixed = `"${fixed}"`;
        }
        if (fixed.indexOf('$')) {
          fixed = fixed.replace(/\$/g, '\\$');
        }

        return fixed;
      }).join(' ');

      return `${this.cmd} ${joinedArgs}`;
    }
    return this.cmd;
  }
}

class Worker {
  constructor() {
    this.id = uuidv4();
    this.created = Date.now();
  }
}

module.exports = {
  Command,
  Worker
}
