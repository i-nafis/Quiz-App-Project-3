// controllers/authController.js
const fs      = require('fs');
const path    = require('path');
const bcrypt  = require('bcrypt');
const mongoose = require('mongoose');

const usersFilePath = path.join(__dirname, '../data/users.json');

function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

// Show the login form
exports.showLogin = (req, res) => {
  res.render('login', { title: 'Login', error: null });
};

// Process login submissions
exports.processLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render('login', { title: 'Login', error: 'Please enter both username and password.' });
  }

  const users = readUsers();
  const user  = users.find(u => u.username === username);
  if (!user) {
    return res.render('login', { title: 'Login', error: 'User not found.' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.render('login', { title: 'Login', error: 'Incorrect password.' });
  }

  // Must have an actual _id on your user objects!
  // (See processRegister below for how to generate one.)
  req.session.user = { _id: user._id, username: user.username };
  res.redirect('/');
};

// Show the registration form
exports.showRegister = (req, res) => {
  res.render('register', { title: 'Register', error: null });
};

// Process registration submissions
exports.processRegister = async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  if (!username || !password || !confirmPassword) {
    return res.render('register', { title: 'Register', error: 'All fields are required.' });
  }

  if (password !== confirmPassword) {
    return res.render('register', { title: 'Register', error: 'Passwords do not match.' });
  }

  // 2) Load and check uniqueness
  const users = readUsers();
  if (users.find(u => u.username === username)) {
    return res.render('register', { title: 'Register', error: 'Username already exists.' });
  }

  // 3) Hash and create new user with a real _id
  const hashedPassword = await bcrypt.hash(password, 10);
  const newId = new mongoose.Types.ObjectId().toHexString();
  users.push({ _id: newId, username, password: hashedPassword, email: '' });
  writeUsers(users);

  res.redirect('/auth/login');
};

// Log the user out
exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/'));
};
