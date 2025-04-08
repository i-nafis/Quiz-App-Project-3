const express = require('express');
const router = express.Router();
// Coded by MST Rahi
/**
 * GET home page
 * Renders the main landing page
 */
router.get('/', (req, res) => {
  res.render('index', { 
    title: 'Quiz App',
    isAuthenticated: !!req.session.user
  });
});

/**
 * GET about page
 * Renders information about the quiz app
 */
router.get('/about', (req, res) => {
  res.render('about', { title: 'About Quiz App' });
});

module.exports = router;