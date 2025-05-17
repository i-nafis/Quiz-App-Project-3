require('dotenv').config();
const express       = require('express');
const path          = require('path');
const cookieParser  = require('cookie-parser');
const session       = require('express-session');
const logger        = require('morgan');
const mongoose      = require('mongoose');

// Route modules
const quizController     = require('./controllers/quizController');
const authRoutes         = require('./routes/auth');
const profileRoutes      = require('./routes/profile');
const quizRoutes         = require('./routes/quiz');
const leaderboardRoutes  = require('./routes/leaderboard');
const authMiddleware     = require('./middleware/authMiddleware');

const app = express();

// ─── 1) CONNECT TO MONGODB ───────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ─── 2) VIEW ENGINE ───────────────────────────────────────────────────────
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ─── 3) MIDDLEWARE ────────────────────────────────────────────────────────
// a) Logging & body‑parsing
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// b) Session (must come *before* any route needing `req.session`)
app.use(session({
  secret: 'quiz-app-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 86400000 }
}));

// c) Expose `user` to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// d) Static files (only once!)
app.use(express.static(path.join(__dirname, 'public')));

// ─── 4) ROUTES ────────────────────────────────────────────────────────────
// Root – shows your index.ejs form to pick # of questions & category
app.get('/', quizController.showQuizForm);

// Auth & profile (no change)
app.use('/auth',    authRoutes);
app.use('/profile', profileRoutes);

// Quiz (protected)
app.use('/quiz', authMiddleware.requireAuth, quizRoutes);

// Leaderboard
app.use('/leaderboard', leaderboardRoutes);

// ─── 5) 404 & ERROR HANDLERS ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('error', { title: '404', error: { message: 'Page Not Found', status: 404 } });
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error   = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500).render('error', { title: 'Error', error: err });
});

module.exports = app;
