function escapeChar(text, char) {
  if (typeof text === 'string') {
    const re = new RegExp(char, 'g');
    return text.replace(re, `\'`);
  }
  return text;
}

function wrapWithSingleQuotes(text) {
  if (typeof text === 'string') {
    const parts = text.split(`'`);
    return parts
      .map(part => `'${part}'`)
      .join(`\\'`);
  }
  return text;
}

module.exports = {
  escapeChar,
  wrap: wrapWithSingleQuotes
};
