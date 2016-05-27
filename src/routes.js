const db = require('./dbUtils.js');

function featuredGames(request, response) {
  db.getCurrentMatches()
    .then((res) => {
      response.send(res);
    });
}

module.exports = {
  featuredGames,
};
