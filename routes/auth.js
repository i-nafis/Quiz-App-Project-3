const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

// Auth routes
router.get('/login', auth.showLogin);
router.post('/login', auth.processLogin);
router.get('/register', auth.showRegister);
router.post('/register', auth.processRegister);
router.get('/logout', auth.logout);
router.get('/api/check-auth', (req, res) => {
    if (req.session.user) {
      return res.status(200).json({ authenticated: true });
    }
    return res.status(401).json({ authenticated: false });
  });

module.exports = router;
