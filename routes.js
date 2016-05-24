const db = require('./db.js');

function featuredGames(request, response) {
  // db will check if the value is already in the cache and not expired
  //  or request a new version and save it
  db.get('featured_games')
    .then((value) => {
      response.json(value);
    })
    .catch((err) => {
      response.status(500).json(err);
    });
}

module.exports = {
  featuredGames,
};
