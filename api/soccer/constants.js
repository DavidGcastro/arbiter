// Player betting markets
const PLAYER_MARKETS = [
  "player_goal_scorer_anytime", // Anytime Goal Scorer (Yes/No)
  "player_first_goal_scorer", // First Goal Scorer (Yes/No)
  "player_last_goal_scorer", // Last Goal Scorer (Yes/No)
  "player_to_receive_card", // Player to receive a card (Yes/No)
  "player_to_receive_red_card", // Player to receive a red card (Yes/No)
  "player_shots_on_target", // Player Shots on Target (Over/Under)
  "player_shots", // Player Shots (Over/Under)
  "player_assists", // Player Assists (Over/Under)
];

// Other soccer betting markets
const SOCCER_MARKETS = [
  "alternate_spreads_corners", // Handicap Corners
  "alternate_totals_corners", // Total Corners (Over/Under)
  "alternate_spreads_cards", // Handicap Cards / Bookings
  "alternate_totals_cards", // Total Cards / Bookings (Over/Under)
  "double_chance", // Double Chance
];

// Standard markets
const STANDARD_MARKETS = [
  "h2h", // Head to Head (Win/Draw/Win)
  "spreads", // Point Spread
  "totals", // Over/Under
];

module.exports = {
  PLAYER_MARKETS,
  SOCCER_MARKETS,
  STANDARD_MARKETS,
};
