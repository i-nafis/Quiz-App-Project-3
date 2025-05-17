// Fixed app.js with proper session ordering and middleware
require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const logger = require('morgan');
const fs = require('fs');
const mongoose = require('mongoose');

// Route modules
const indexRoutes = require('./routes/index');
const quizRoutes = require('./routes/quiz');
const authRoutes = require('./routes/auth');
const leaderboardRoutes = require('./routes/leaderboard');
const profileRoutes = require('./routes/profile');

// Middleware
const authMiddleware = require('./middleware/authMiddleware');

// Express app
const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Load quiz data
let quizQuestions = [];
try {
  const data = fs.readFileSync(path.join(__dirname, 'data', 'questions.json'), 'utf8');
  quizQuestions = JSON.parse(data);
  console.log(`📚 Loaded ${quizQuestions.length} quiz questions`);
} catch (err) {
  console.error('Error loading quiz questions:', err);
}

// Make quiz data globally available to EJS views
app.locals.quizQuestions = quizQuestions;

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Logging and body parsing
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ✅ Session setup BEFORE routes
app.use(session({
  secret: 'quiz-app-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Must be false for localhost
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// ✅ Set user for all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/quiz', authMiddleware.requireAuth, quizRoutes);
app.use('/leaderboard', leaderboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { title: 'Page Not Found', error: { message: 'Page Not Found', status: 404 } });
});

// Global error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error', { title: 'Error', error: err });
});

// Export the app for bin/www
module.exports = app;