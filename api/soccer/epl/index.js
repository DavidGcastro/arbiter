const path = require("path");
const fetch = require("node-fetch");
const { buildURL, buildEventURL } = require("./constants.js");
const { convertOddsObjectToCsv } = require("../../csvGenerator.js");
require("dotenv").config();

const getEventData = async (event) => {
  const gameKey = `home ${event.home_team} vs away ${event.away_team}`;

  try {
    const response = await fetch(buildEventURL(event.id));
    const data = await response.json();
    const bookmakers = Array.isArray(data.bookmakers) ? data.bookmakers : [];

    const marketsByBookmaker = bookmakers.reduce((bookmakerAcc, bookmaker) => {
      const bookmakerKey = bookmaker.key;
      if (!bookmakerKey) {
        return bookmakerAcc;
      }

      const markets = bookmaker.markets;

      const marketsByType = markets.reduce((marketAcc, market) => {
        const marketKey = market.key;
        if (!marketKey) {
          return marketAcc;
        }

        const outcomes = Array.isArray(market.outcomes)
          ? market.outcomes.map((outcome) => ({
              ...outcome,
              name:
                outcome.name ||
                outcome.description ||
                outcome.participant ||
                null,
              description: outcome.description || null,
              participant: outcome.participant || null,
              price: outcome.price ?? outcome.odds ?? outcome.decimal ?? null,
              point: outcome.point ?? outcome.handicap ?? null,
            }))
          : [];

        marketAcc[marketKey] = {
          outcomes,
          lastUpdate: market.last_update || null,
          key: market.key || null,
          title: market.name || null,
        };
        return marketAcc;
      }, {});

      bookmakerAcc[bookmakerKey] = { markets: marketsByType };
      return bookmakerAcc;
    }, {});

    return {
      game: gameKey,
      bookmakers: marketsByBookmaker,
    };
  } catch (error) {
    throw new Error(`Failed to fetch event data: ${error.message}`);
  }
};

/**
 * Fetches EPL soccer odds from The Odds API
 * @returns {Promise<Object>} Promise that resolves to the API response
 */
async function fetchEPLOdds() {
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ODDS_API_KEY environment variable is not set. Please add it to your .env file."
    );
  }

  try {
    const url = buildURL();
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    const marketDataEntries = await Promise.all(
      data.map((event) => getEventData(event))
    );
    const marketDataByGame = marketDataEntries.reduce(
      (acc, { game, bookmakers }) => {
        if (game) {
          acc[game] = { bookmakers };
        }
        return acc;
      },
      {}
    );

    return marketDataByGame;
  } catch (error) {
    throw new Error(`Failed to fetch odds: ${error.message}`);
  }
}

/**
 * Main function to fetch and display EPL odds
 */
async function main() {
  try {
    const marketDataByGame = await fetchEPLOdds();
    const outputPath = path.join(__dirname, "market-data.csv");
    convertOddsObjectToCsv({
      data: marketDataByGame,
      outputPath,
    });
    return marketDataByGame;
  } catch (error) {
    throw new Error(`Failed to fetch odds: ${error.message}`);
  }
}

// Export functions for use in other modules
module.exports = {
  fetchEPLOdds,
  main,
};

// Run the main function if this file is executed directly
if (require.main === module) {
  main();
}
