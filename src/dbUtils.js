const levelup = require('level');
const exists = require('level-exists');
const Promise = require('bluebird');
const moment = require('moment');
const db = levelup('./local_db', {
  keyEncoding: 'json',
});
exists.install(db);

function setKeyValue(key, value) {
  return new Promise((resolve, reject) => {
    // Always stringify the object before saving to the db
    db.put(key, JSON.stringify(value), (putErr) => {
      if (putErr) {
        // TODO implement error logging
        reject(putErr);
      }
      resolve(true);
    });
  });
}

// check if the value is expired for that key
function checkExpire(key, value) {
  const now = moment();
  return new Promise((resolve, reject) => {
    db.get(key, (getErr, dbValue) => {
      const data = JSON.parse(dbValue);
      if (now.isAfter(moment(data.expireDatestamp))) {
        // the cache is expired then save a new version
        setKeyValue(key, value)
          .then(() => {
            resolve(true);
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        resolve(true);
      }
    });
  });
}

function putWithExpire(key, value) {
  return new Promise((resolve, reject) => {
    // check if the key exists first
    db.exists(key, (existErr, exist) => {
      if (existErr) {
        // TODO implement error logging
        reject(existErr);
        return;
      }
      // if the key doesn't exist we save the data
      if (!exist) {
        setKeyValue(key, value)
          .then(() => {
            resolve(true);
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        // if the key exist then check if the cache is invalid save the data
        checkExpire(key, value)
          .then(() => {
            resolve(true);
          })
          .catch((err) => console.log(err));
      }
    });
  });
}

function putWithoutExpire(key, value) {
  return new Promise((resolve, reject) => {
    // check if the key exists first
    db.exists(key, (existErr, exist) => {
      if (existErr) {
        // TODO implement error logging
        reject(existErr);
        return;
      }
      // if the key doesn't exist we save the data
      if (!exist) {
        setKeyValue(key, value)
          .then(() => {
            resolve(true);
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        resolve(true);
      }
    });
  });
}

function getMatch(match) {
  return new Promise((resolve, reject) => {
    db.get(`match_${match.gameId}`, (err, res) => {
      if (err) {
        reject(err);
      }
      resolve(JSON.parse(res));
    });
  });
}

function getCurrentMatches() {
  return new Promise((resolve, reject) => {
    db.get('featured_games', (getErr, res) => {
      if (getErr) {
        reject(getErr);
      }
      const featuredGames = JSON.parse(res);
      const dbQueries = featuredGames.gameList.map(getMatch);
      Promise.all(dbQueries)
        .then((resArray) => {
          resolve(resArray);
        })
        .catch((err) => console.log(err));
    });
  });
}

module.exports = {
  putWithExpire,
  putWithoutExpire,
  getCurrentMatches,
};
