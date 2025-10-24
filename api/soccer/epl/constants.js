const {
  REGIONS,
  ODDS_FORMAT,
  api_base_url,
  api_version,
  BOOKMAKERS,
} = require("../../../constants.js");

const {
  PLAYER_MARKETS,
  SOCCER_MARKETS,
  STANDARD_MARKETS,
} = require("../constants.js");

const markets = [...STANDARD_MARKETS, ...PLAYER_MARKETS, ...SOCCER_MARKETS];
const SPORT_NAME = "soccer_epl";

function buildURL() {
  const API_KEY = process.env.ODDS_API_KEY;
  return `${api_base_url}/${api_version}/sports/${SPORT_NAME}/odds?regions=${REGIONS}&oddsFormat=${ODDS_FORMAT}&apiKey=${API_KEY}&bookmakers=${BOOKMAKERS}`;
}

function buildEventURL(eventId) {
  const API_KEY = process.env.ODDS_API_KEY;
  return `${api_base_url}/${api_version}/sports/${SPORT_NAME}/events/${eventId}/odds?regions=${REGIONS}&oddsFormat=${ODDS_FORMAT}&apiKey=${API_KEY}&bookmakers=${BOOKMAKERS}&markets=${markets.join(
    ","
  )}`;
}

module.exports = { buildURL, buildEventURL };
