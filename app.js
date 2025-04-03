const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const logger = require('morgan');
const fs = require('fs');

// Import route modules
const indexRoutes = require('./routes/index');
const quizRoutes = require('./routes/quiz');
const authRoutes = require('./routes/auth');
const leaderboardRoutes = require('./routes/leaderboard');

// Import middleware
const authMiddleware = require('./middleware/auth');

// Initialize Express app
const app = express();

// Load questions once at startup
let quizQuestions = [];
try {
  const questionsData = fs.readFileSync(path.join(__dirname, 'data', 'questions.json'), 'utf8');
  quizQuestions = JSON.parse(questionsData);
  console.log(`Loaded ${quizQuestions.length} quiz questions`);
} catch (err) {
  console.error('Error loading questions:', err);
}

// Make questions available application-wide
app.locals.quizQuestions = quizQuestions;

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: 'quiz-app-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Make user data available to all templates
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/quiz', authMiddleware.requireAuth, quizRoutes); // Protected route
app.use('/leaderboard', leaderboardRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error', { title: 'Error' });
});

module.exports = app;