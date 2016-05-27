const getMatchUIElements = require('./getMatchUIElements.js');
const LolApi = require('./api.js');
const moment = require('moment');
const db = require('./dbUtils.js');

function cacheFeaturedGames(response) {
  // adding the expire datestamp
  const featuredGames = response;
  // create the expire datestamp
  featuredGames.expireDatestamp = moment().add(response.clientRefreshInterval, 's').toDate();
  return new Promise((resolve, reject) => {
    db.putWithExpire('featured_games', featuredGames)
      .then(() => {
        console.log('featured_games is cached with expire');
        resolve(featuredGames);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
}

function cacheSingleMatches(featuredGames) {
  const UIElementsToRetrieve = featuredGames.gameList.map(getMatchUIElements);
  Promise.all(UIElementsToRetrieve)
    .then((elements) => {
      elements.forEach((matchElements) => {
        db.putWithoutExpire(`match_${matchElements.gameId}`, matchElements)
          .then(() => {
            console.log(`match_${matchElements.gameId} saved`);
          })
          .catch((err) => console.log(err));
      });
    })
    .catch((err) => console.log(err));
}

function updateMainCache() {
  LolApi.getFeaturedGames('euw')
    .then(cacheFeaturedGames)
    .then(cacheSingleMatches)
    .catch((err) => console.log(err));
}

function setRefreshInterval(featuredGames) {
  const intervalMs = featuredGames.clientRefreshInterval * 1000;
  console.log('Will refresh the cache in ', intervalMs);
  setInterval(() => {
    updateMainCache();
  }, intervalMs);
  return featuredGames;
}

function createMainCache() {
  return new Promise((resolve, reject) => {
    LolApi.getFeaturedGames('euw')
      .then(setRefreshInterval)
      .then(cacheFeaturedGames)
      .then(cacheSingleMatches)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

module.exports = createMainCache;
