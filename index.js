// load .env variables
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const createMainCache = require('./src/createCache.js');

console.log('Building the initial cache...');
createMainCache();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false,
}));

const routes = require('./src/routes.js');

app.get('/featured_games', routes.featuredGames);

const server = app.listen(process.env.PORT || 3000, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log('Riot example app listening at http://%s:%s', host, port);
});

module.exports = app;
