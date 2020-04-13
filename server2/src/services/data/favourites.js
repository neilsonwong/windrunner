'use strict';

const favouritesDb = require('./levelDbService').instanceFor('favourites');

class FavFolder {
  constructor(folderPath) {
    this.folderPath = folderPath;
    this.created = Date.now();
  }
}

async function get() {
  const favouritesList = await favouritesDb.all();
  const favs = (favouritesList === undefined) ?
    [] : 
    Object.keys(favouritesList).map((key) => {
      return favouritesList[key].folderPath;
    });
  return favs;
}

// async function isPinned(folder) {
//   const pinned = await pinDb.get(folder);
//   return (pinned !== undefined);
// }

function set(folderPath) {
  return favouritesDb.put(folderPath, new FavFolder(folderPath));
}

function remove(folderPath) {
  return favouritesDb.del(folderPath);
}

module.exports = {
  get,
  set,
  remove
};