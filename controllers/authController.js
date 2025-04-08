const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const usersFilePath = path.join(__dirname, '../data/users.json');

const readUsers = () => {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const writeUsers = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

// Render login page
exports.showLogin = (req, res) => {
  res.render('login', { title: 'Login', error: null });
};

// Handle login
exports.processLogin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.render('login', { title: 'Login', error: 'Please enter both username and password.' });
  }

  const users = readUsers();
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.render('login', { title: 'Login', error: 'User not found.' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.render('login', { title: 'Login', error: 'Incorrect password.' });
  }

  req.session.user = { username };
  res.redirect('/');
};

// Render register page
exports.showRegister = (req, res) => {
  res.render('register', { title: 'Register', error: null });
};

// Handle registration
exports.processRegister = async (req, res) => {
  const { username, password, confirmPassword } = req.body;
  if (!username || !password || !confirmPassword) {
    return res.render('register', { title: 'Register', error: 'All fields are required.' });
  }
  if (password !== confirmPassword) {
    return res.render('register', { title: 'Register', error: 'Passwords do not match.' });
  }

  const users = readUsers();
  if (users.find(u => u.username === username)) {
    return res.render('register', { title: 'Register', error: 'Username already exists.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  writeUsers(users);

  res.redirect('/auth/login');
};

// Handle logout
exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/'));
};
