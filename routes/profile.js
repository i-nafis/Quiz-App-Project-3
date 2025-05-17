// ✅ Fixed routes/profile.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const QuizAttempt = require('../models/QuizAttempt');

router.get('/', authMiddleware.requireAuth, async (req, res) => {
  try {
    const user = {
      username: req.session.user.username,
      email: req.session.user.email
    };

    const attempts = await QuizAttempt.find({ user: user.username }).sort({ submittedAt: -1 });

    res.render('profile', {
      title: 'Your Profile',
      user,
      attempts
    });
  } catch (err) {
    console.error('❌ Profile error:', err);
    res.status(500).render('error', { title: 'Profile Error', error: err });
  }
});

module.exports = router;