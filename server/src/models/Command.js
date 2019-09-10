'use strict';

const uuidv4 = require('uuid/v4');

class Command {
  constructor(cmd, args, opts) {
    this.id = uuidv4();
    this.cmd = cmd;
    this.args = args;
    this.runRemotely = opts && opts.remote === true;
    this.stream = opts && opts.stream;
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

module.exports = Command;
