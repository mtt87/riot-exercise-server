const levelup = require('level');
const fetch = require('node-fetch');
const exists = require('level-exists');
const Promise = require('bluebird');
const db = levelup('./local_db', {
  keyEncoding: 'json',
});
exists.install(db);
const RIOT_API_KEY = process.env.RIOT_API_KEY;

const endpoints = {
  featured_games: `https://euw.api.pvp.net/observer-mode/rest/featured?api_key=${RIOT_API_KEY}`,
};

function getValue(endpoint) {
  return new Promise((resolve, reject) => {
    // check if the value is already stored
    db.exists(endpoint, (existErr, exist) => {
      if (existErr) {
        reject(existErr);
      }
      // if the value doesn't exist then fetch it from Riot API endpoint
      if (!exist) {
        fetch(endpoints[endpoint])
          .then((res) => res.json())
          .then((JSONres) => {
            // send the value immediately back to our user requesting it
            resolve(JSONres);
            // store the value in the db for future requests
            db.put(endpoint, JSON.stringify(JSONres), (putErr) => {
              if (putErr) {
                reject(putErr);
              }
            });
          });
      } else {
        // get cached version
        db.get(endpoint, (getErr, value) => {
          if (getErr) {
            reject(getErr);
          }
          // value is a string so we have to convert back to JSON
          // before sending it back to the client
          resolve(JSON.parse(value));
        });
      }
    });
  });
}

module.exports = {
  get: getValue,
};
