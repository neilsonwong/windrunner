'use strict';

const uuidv4 = require('uuid/v4');

class Command {
  constructor(cmd, args, runRemotely) {
    this.cmd = cmd;
    this.args = args;
    this.runRemotely = runRemotely === true;
    this.id = uuidv4();
  }

  toStringCmd() {
    // add doublequotes for spaces
    // TODO: can change to a regex in the future
    if (this.args) {
      let joinedArgs = this.args.map(e => {
        let fixed = e;
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
