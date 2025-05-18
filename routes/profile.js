// ✅ Updated /routes/profile.js to query attempts by user._id as string
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const QuizAttempt = require('../models/QuizAttempt');

router.get('/', authMiddleware.requireAuth, async (req, res) => {
  try {
    const user = {
      _id: req.session.user._id,
      username: req.session.user.username,
      email: req.session.user.email || ''
    };

    // ✅ Query quiz attempts by user._id (as string)
    const attempts = await QuizAttempt.find({ user: user._id }).sort({ submittedAt: -1 });

    res.render('profile', {
      title: 'Your Profile',
      user,
      attempts
    });
  } catch (err) {
    console.error('❌ Error loading profile:', err);
    res.status(500).render('error', {
      title: 'Profile Error',
      error: err
    });
  }
});

module.exports = router;