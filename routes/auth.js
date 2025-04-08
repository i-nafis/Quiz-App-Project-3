const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

// Auth routes
router.get('/login', auth.showLogin);
router.post('/login', auth.processLogin);
router.get('/register', auth.showRegister);
router.post('/register', auth.processRegister);
router.get('/logout', auth.logout);

module.exports = router;
