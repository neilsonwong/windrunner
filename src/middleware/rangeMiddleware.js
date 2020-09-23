'use strict';

async function parseRange(ctx, next) {
  // parse the range if it exists
  if (ctx.header.range) {
    const ranges = rangeParse(ctx.header.range);
    let [start, end] = ranges[0];
    ctx.state.range = { start, end };
  }

  await next();
};

function rangeParse (str) {
  const token = str.split('=')
  if (!token || token.length !== 2 || token[0] !== 'bytes') {
    return null
  }
  return token[1]
    .split(',')
    .map((range) => {
      return range.split('-').map((value) => {
        if (value === '') {
          return Infinity
        }
        return Number(value)
      })
    })
    .filter((range) => {
      return !isNaN(range[0]) && !isNaN(range[1]) && range[0] <= range[1]
    })
}

module.exports = parseRange;
