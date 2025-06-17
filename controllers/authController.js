// controllers/authController.js
const bcrypt = require('bcrypt');
const User   = require('../models/User');

// ─── Show the login form ─────────────────────────────────────────────────
exports.showLogin = (req, res) => {
  res.render('login', { title: 'Login', error: null });
};

// ─── Handle login submissions ─────────────────────────────────────────────
exports.processLogin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.render('login', {
      title: 'Login',
      error: 'Please enter both username and password.',
    });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.render('login', {
        title: 'Login',
        error: 'User not found.',
      });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.render('login', {
        title: 'Login',
        error: 'Incorrect password.',
      });
    }

    // Store minimal user info in session
    req.session.user = {
      _id:       user._id.toString(),
      username:  user.username,
      email:     user.email,
    };

    res.redirect('/');
  } catch (err) {
    console.error('❌ Error in processLogin:', err);
    res.render('login', {
      title: 'Login',
      error: 'Server error. Please try again later.',
    });
  }
};

// ─── Show the registration form ──────────────────────────────────────────
exports.showRegister = (req, res) => {
  res.render('register', { title: 'Register', error: null });
};

// ─── Handle registration submissions ─────────────────────────────────────
exports.processRegister = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    return res.render('register', {
      title: 'Register',
      error: 'All fields are required.',
    });
  }
  if (password !== confirmPassword) {
    return res.render('register', {
      title: 'Register',
      error: 'Passwords do not match.',
    });
  }

  try {
    // 1) Check username uniqueness
    if (await User.exists({ username })) {
      return res.render('register', {
        title: 'Register',
        error: 'Username already exists.',
      });
    }
    // 2) Check email uniqueness
    if (await User.exists({ email })) {
      return res.render('register', {
        title: 'Register',
        error: 'Email already in use.',
      });
    }

    // 3) Hash & create
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ username, email, passwordHash });

    res.redirect('/auth/login');
  } catch (err) {
    console.error('❌ Error in processRegister:', err);
    res.render('register', {
      title: 'Register',
      error: 'Server error. Please try again later.',
    });
  }
};

// ─── Log out ──────────────────────────────────────────────────────────────
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) console.error('❌ Session destroy error:', err);
    res.redirect('/');
  });
};
