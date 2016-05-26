const db = require('./dbUtils.js');

function featuredGames(request, response) {
  // db will check if the value is already in the cache and not expired
  //  or request a new version and save it
  db.getCurrentMatches()
    .then((res) => {
      console.log(typeof(res));
      response.send(res);
    });
}

module.exports = {
  featuredGames,
};
