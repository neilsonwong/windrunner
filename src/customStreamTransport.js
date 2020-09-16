const Transport = require('winston-transport');

class CustomStreamTransport extends Transport {
  constructor(stream) {
    super();
    this.customStream = stream;
  }

  log(info, callback) {
    this.customStream.push(`${info.level}: ${info.message}\n`);
    callback();
  }
}

module.exports = CustomStreamTransport;