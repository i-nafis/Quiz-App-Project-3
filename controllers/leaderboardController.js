// controllers/leaderboardController.js
const Score = require('../models/Score');
const User  = require('../models/User');

/**
 * Add or update a user’s score for a given quiz mode.
 * @param {String} userId    – Mongoose ObjectId string of the user
 * @param {Number} scoreValue – numeric score to record
 * @param {Number} mode       – number of questions in that quiz
 */
exports.addScore = async (userId, scoreValue, mode) => {
  try {
    // Upsert: if an entry exists for this user+mode, keep the higher score
    const existing = await Score.findOne({ user: userId, mode });

    if (existing) {
      if (scoreValue > existing.score) {
        existing.score      = scoreValue;
        existing.recordedAt = new Date();
        await existing.save();
      }
      // else: do nothing if new score is not higher
    } else {
      await Score.create({
        user: userId,
        score: scoreValue,
        mode
      });
    }
  } catch (err) {
    console.error('❌ Error in addScore:', err);
  }
};


/**
 * GET /leaderboard
 * Renders the leaderboard page, grouped by quiz length (mode).
 */
exports.getLeaderboard = async (req, res, next) => {
  try {
    // Fetch all scores, populate username
    const allScores = await Score
      .find({})
      .populate('user', 'username')
      .sort({ score: -1 })
      .lean();

    // Group by `mode` (number of questions)
    const groupedEntries = allScores.reduce((acc, entry) => {
      const key = entry.mode;
      if (!acc[key]) acc[key] = [];
      acc[key].push({
        username: entry.user.username,
        score:    entry.score,
        date:     entry.recordedAt
      });
      return acc;
    }, {});

    res.render('leaderboard', {
      title: 'Leaderboard',
      groupedEntries
    });
  } catch (err) {
    next(err);
  }
};
