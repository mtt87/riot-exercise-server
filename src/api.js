const LolApi = require('leagueapi');
LolApi.init(process.env.RIOT_API_KEY, 'euw');

module.exports = LolApi;
