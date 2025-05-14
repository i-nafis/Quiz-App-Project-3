// app.js
// ---------------------------------------------
// This is the main application file for the Quiz App.
// It initializes the Express app, configures middleware,
// sets up the view engine (EJS), loads quiz data,
// and mounts the various route modules for the app.
// ---------------------------------------------
require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const logger = require('morgan');
const fs = require('fs');
const mongoose = require('mongoose');

// Import route modules.
const indexRoutes = require('./routes/index');
const quizRoutes = require('./routes/quiz');
const authRoutes = require('./routes/auth');
const leaderboardRoutes = require('./routes/leaderboard');

// Import custom authentication middleware.
const authMiddleware = require('./middleware/authMiddleware');

// Initialize Express app.
const app = express();
// app.set('trust proxy', true);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('Successfully connected to MongoDB');
})
.catch((error) => {
  console.log('MongoDB connection error, error');
});

// Load quiz questions at startup from the JSON file.
let quizQuestions = [];
try {
  const questionsData = fs.readFileSync(path.join(__dirname, 'data', 'questions.json'), 'utf8');
  quizQuestions = JSON.parse(questionsData);
  console.log(`Loaded ${quizQuestions.length} quiz questions`);
} catch (err) {
  console.error('Error loading questions:', err);
}

// Make questions available to all templates via app.locals.
app.locals.quizQuestions = quizQuestions;

// Setup view engine to use EJS and set views directory.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware setup.
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Serve static files from the 'public' folder.
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration.
app.use(session({
  secret: 'quiz-app-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Make user data available in all views.
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Route handling:
// - The home page and authentication routes.
app.use('/', indexRoutes);
app.use('/auth', authRoutes);

// - Protect quiz routes with authentication middleware and mount quiz routes.
//   Note: The authentication middleware is applied before the quiz routes.
app.use('/quiz', authMiddleware.requireAuth, quizRoutes);

// - Mount leaderboard routes.
app.use('/leaderboard', leaderboardRoutes);

// 404 handler for undefined routes.
app.use((req, res, next) => {
  res.status(404).render('/error', { title: 'Page Not Found' });
});

// Global error handler.
app.use((err, req, res, next) => {
  // Set locals, providing error only in development environment.
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  // Render the error page with status code or default to 500.
  res.status(err.status || 500);
  res.render('error', { title: 'Error' });
});

// Export the app module so it can be used by bin/www.
module.exports = app;

//app.listen(3000, '0.0.0.0', () => {
//  console.log("Server running on port 3000");
// });
