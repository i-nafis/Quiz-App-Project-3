const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Placeholder for authController - this will be implemented by Team Member 2
// This is just a stub to make the app work initially
const authController = {
  showLogin: (req, res) => {
    res.render('login', { title: 'Login' });
  },
  processLogin: (req, res) => {
    res.redirect('/');
  },
  showRegister: (req, res) => {
    res.render('register', { title: 'Register' });
  },
  processRegister: (req, res) => {
    res.redirect('/auth/login');
  },
  logout: (req, res) => {
    req.session.destroy();
    res.redirect('/');
  }
};

/**
 * GET /auth/login
 * Show login form
 */
router.get('/login', authMiddleware.redirectIfAuthenticated, authController.showLogin);

/**
 * POST /auth/login
 * Process login attempt
 */
router.post('/login', authMiddleware.redirectIfAuthenticated, authController.processLogin);

/**
 * GET /auth/register
 * Show registration form
 */
router.get('/register', authMiddleware.redirectIfAuthenticated, authController.showRegister);

/**
 * POST /auth/register
 * Process registration
 */
router.post('/register', authMiddleware.redirectIfAuthenticated, authController.processRegister);

/**
 * GET /auth/logout
 * Log user out
 */
router.get('/logout', authController.logout);

module.exports = router;