const express = require('express');
const router = express.Router();

// Placeholder for leaderboardController - this will be implemented by Team Member 3
// This is just a stub to make the app work initially
const leaderboardController = {
  getLeaderboard: (req, res) => {
    res.render('leaderboard', { 
      title: 'Leaderboard',
      leaderboard: [] // Empty leaderboard for now
    });
  }
};

/**
 * GET /leaderboard
 * Display the leaderboard
 */
router.get('/', leaderboardController.getLeaderboard);

module.exports = router;