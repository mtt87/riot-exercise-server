require('dotenv').config();
const LolApi = require('./api.js');
const Promise = require('bluebird');

function generateSpellImageUrl(spellPath) {
  return `http://ddragon.leagueoflegends.com/cdn/6.10.1/img/spell/${spellPath}`;
}

function generateChampSmallImageUrl(champPath) {
  return `http://ddragon.leagueoflegends.com/cdn/6.10.1/img/champion/${champPath}`;
}

function generateChampBigImageUrl(champPath) {
  return `http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champPath.replace('.png', '')}_0.jpg`;
}

const options = {
  spell: {
    spellData: 'image',
  },
  champion: {
    champData: 'image',
  },
};

// GET UI elements for a single participant (spell1, spell2, champion)
function getParticipantUI(participant) {
  // preparing the array of promises to resolve
  // in order to get all the elements
  const elements = [
    LolApi.Static.getSummonerSpellById(participant.spell1Id, options.spell),
    LolApi.Static.getSummonerSpellById(participant.spell2Id, options.spell),
    LolApi.Static.getChampionById(participant.championId, options.champion),
    participant.summonerName,
    participant.teamId,
  ];

  return new Promise((resolve, reject) => {
    // Consume all the promises and return an array of results
    Promise.all(elements)
      .then((resArray) => {
        resolve({
          spell1Image: resArray[0].image.full,
          spell2Image: resArray[1].image.full,
          championImage: resArray[2].image.full,
          summonerName: resArray[3],
          teamId: resArray[4],
        });
      })
      .catch((err) => {
        // TODO implement logging
        console.log(err);
        reject(err);
      });
  });
}

//
function buildResponse(participants) {
  const responseArray = [];
  participants.forEach((participant) => {
    const e = {
      summonerName: participant.summonerName,
      spell1Image: generateSpellImageUrl(participant.spell1Image),
      spell2Image: generateSpellImageUrl(participant.spell2Image),
      championBig: generateChampBigImageUrl(participant.championImage),
      championSmall: generateChampSmallImageUrl(participant.championImage),
      teamId: participant.teamId,
    };
    responseArray.push(e);
  });
  return responseArray;
}

function getMatchUIElements(match) {
  const apiCalls = match.participants.map(getParticipantUI);
  return new Promise((resolve, reject) => {
    Promise.all(apiCalls)
      .then(buildResponse)
      .then((UIelements) => {
        resolve({
          gameId: match.gameId,
          participants: UIelements,
        });
      })
      .catch((err) => {
        // TODO implement logging
        console.log(err);
        reject(err);
      });
  });
}

module.exports = getMatchUIElements;
