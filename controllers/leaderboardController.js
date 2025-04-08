const fs = require('fs');
const path = require('path');

const leaderboardFile = path.join(__dirname, '../data/leaderboard.json');

// Read the leaderboard JSON data
const readLeaderboard = () => {
  try {
    return JSON.parse(fs.readFileSync(leaderboardFile, 'utf8'));
  } catch (err) {
    return [];
  }
};

// Write to leaderboard JSON
const writeLeaderboard = (data) => {
  fs.writeFileSync(leaderboardFile, JSON.stringify(data, null, 2));
};

/**
 * GET /leaderboard
 * Renders the leaderboard page.
 */
exports.getLeaderboard = (req, res) => {
  const leaderboard = readLeaderboard();

  // Sort by highest score
  leaderboard.sort((a, b) => b.score - a.score);

  // Render the view and pass the sorted list
  res.render('leaderboard', {
    title: 'Leaderboard',
    entries: leaderboard
  });
};

/**
 * POST /quiz/submit-json
 * Called from frontend to save score.
 */
exports.addScore = (username, score) => {
  let leaderboard = readLeaderboard();
  console.log("🏁 addScore() called for:", username, score);
  console.log("📋 Current leaderboard before:", leaderboard);

  const existingIndex = leaderboard.findIndex(entry => entry.username === username);

  if (existingIndex >= 0) {
    if (score > leaderboard[existingIndex].score) {
      console.log(`🔁 Updating ${username}'s score from ${leaderboard[existingIndex].score} to ${score}`);
      leaderboard[existingIndex].score = score;
      leaderboard[existingIndex].date = new Date().toISOString();
    } else {
      console.log(`📉 Not updating — ${score} is not higher than ${leaderboard[existingIndex].score}`);
    }
  } else {
    console.log(`🆕 Adding new user ${username} with score ${score}`);
    leaderboard.push({ username, score, date: new Date().toISOString() });
  }

  writeLeaderboard(leaderboard);
  console.log("✅ Leaderboard updated and written to file.");
};
