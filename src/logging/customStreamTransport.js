const Transport = require('winston-transport');

class CustomStreamTransport extends Transport {
  constructor(stream, options) {
    super(options);
    this.customStream = stream;
  }

  log(info, callback) {
    this.customStream.push(JSON.stringify(info));
    this.customStream.push('\n');
    callback();
  }
}

module.exports = CustomStreamTransport;