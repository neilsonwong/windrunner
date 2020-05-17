'use strict';

const yearRegex = RegExp(/\(([1,2][0-9]{3})\)/g);
const seasonXRegex = RegExp(/s([0-9])/g);

function getYear(haystack) {
  const needle = yearRegex.exec(haystack);
  if (needle !== null && Array.isArray(needle) && needle.length > 0) {
    return needle[1];
  }
  return null;
};

function getSeasonSynonyms(haystack) {
  const needle = seasonXRegex.exec(haystack);
  if (needle !== null && Array.isArray(needle) && needle.length > 0) {
    const seasonNumber = needle[1];
    return [
      haystack,                                                            // SX
      haystack.replace(`s${seasonNumber}`, `season ${seasonNumber}`),      // Season X
      haystack.replace(`s${seasonNumber}`, `${nth(seasonNumber)} season`)  // nth Season
    ];
  }
  return null;
}

module.exports = {
  getYear,
  getSeasonSynonyms
};

function nth(number) {
  switch(number) {
    case '1':
      return '1st';
    case '2':
      return '2nd';
    case '3':
      return '3';
    default:
      return `${number}th`;
  }
}