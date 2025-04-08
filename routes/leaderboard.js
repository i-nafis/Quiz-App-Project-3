const express = require('express');
const router = express.Router();

// ✅ Import the actual controller from the file
const leaderboardController = require('../controllers/leaderboardController');

// GET /leaderboard
router.get('/', leaderboardController.getLeaderboard);

// Export the router
module.exports = router;

