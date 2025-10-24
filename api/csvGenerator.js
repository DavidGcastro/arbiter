// odds_to_csv.js
// Accepts a JS object (array of game objects OR a single game object), not JSON text.
// Exports convertOddsObjectToCsv({ data, outputPath, returnString }) -> { rows, csvPath?, csv? }

const fs = require("fs");
const path = require("path");

// ---- helpers ----
function csvEscape(val) {
  if (val === null || val === undefined) return "";
  const s = String(val);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function cleanGameName(game) {
  if (!game || typeof game !== "string") return "";
  // "home Leeds United vs away West Ham United" -> "Leeds United vs West Ham United"
  return game.replace(/^home\s+/i, "").replace(/\s+vs\s+away\s+/i, " vs ");
}

/**
 * Flattens odds object(s) into CSV.
 *
 * @param {Object} options
 * @param {Object|Object[]} options.data - A single game object or an array of game objects.
 * @param {string} [options.outputPath]  - If provided, write CSV to this path.
 * @param {boolean} [options.returnString=false] - If true, also return the CSV string.
 * @returns {{ rows: number, csvPath?: string, csv?: string }}
 */
function convertOddsObjectToCsv({ data, outputPath, returnString = false }) {
  if (!data) {
    throw new Error(
      "convertOddsObjectToCsv: 'data' is required (object or array)."
    );
  }

  // Normalize to array of games
  let games;
  if (Array.isArray(data)) {
    games = data;
  } else if (data && typeof data === "object" && !Array.isArray(data)) {
    if (data.game || data.bookmakers) {
      games = [data];
    } else {
      games = Object.entries(data).map(([game, value]) => ({
        game,
        ...(value || {}),
      }));
    }
  } else {
    throw new Error(
      "convertOddsObjectToCsv: 'data' must be an object representing games or an array of such objects."
    );
  }

  const headers = [
    "game",
    "bookmaker",
    "market",
    "outcome_name",
    "player",
    "point",
    "price",
    "last_update",
  ];

  const rows = [];

  for (const gameObj of games) {
    if (!gameObj || typeof gameObj !== "object") continue;

    const game = cleanGameName(gameObj.game);
    const bookmakers =
      gameObj.bookmakers && typeof gameObj.bookmakers === "object"
        ? gameObj.bookmakers
        : {};

    for (const [bookmakerName, bookmakerObj] of Object.entries(bookmakers)) {
      const markets = (bookmakerObj && bookmakerObj.markets) || {};

      for (const [marketKey, marketObj] of Object.entries(markets)) {
        if (!marketObj || typeof marketObj !== "object") continue;

        const market = marketObj.key || marketKey;
        const lastUpdate = marketObj.lastUpdate || "";
        const outcomes = Array.isArray(marketObj.outcomes)
          ? marketObj.outcomes
          : [];

        for (const outcome of outcomes) {
          rows.push({
            game,
            bookmaker: bookmakerName,
            market,
            outcome_name: outcome?.name ?? "",
            player: outcome?.description ?? "",
            point: outcome?.point ?? "",
            price: outcome?.price ?? "",
            last_update: lastUpdate,
          });
        }
      }
    }
  }

  const csvLines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(",")),
  ];
  const csv = csvLines.join("\n");

  let csvPath;
  if (outputPath) {
    fs.writeFileSync(outputPath, csv, "utf8");
    csvPath = path.resolve(outputPath);
  }

  const result = { rows: rows.length };
  if (csvPath) result.csvPath = csvPath;
  if (returnString) result.csv = csv;
  return result;
}

module.exports = { convertOddsObjectToCsv };
