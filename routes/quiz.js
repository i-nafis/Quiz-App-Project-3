// routes/quiz.js
// -------------------------------------
// Defines quiz-related routes: quiz page, submission, and score submission.
// Uses real controller logic from controllers/quizController.js.
// -------------------------------------

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const User = require('../models/User');
const Score = require('../models/Score');
const QuizAttempt = require('../models/QuizAttempt'); 

// Ensure MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.catch((err) => console.error('MongoDB connection error: ', err));

// Route for registering a new user
router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const newUser = new User({
      username,
      password,
      email
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfullly!' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to register user', details: err });
  }
});

// Save user's score
router.post('/submit-score', async (req, res) => {
  const { userId, score } = req.body;

  try {
    const newScore = new Score({
      score,
      user: userId,
    });

    await newScore.save();

    const user = await User.findById(userId);
    user.scores.push(newScore._id);
    await user.save();

    res.status(200).json({ message: 'Score saved successfully!' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to save score', details: err });
  }
});

// Create and populate leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const topScores = await Score.find()
      .sort({ score: -1 })
      .limit(10)
      .populate('user', 'username');

    res.status(200).json(topScores);
  } catch (err) {
    res.status(400).json({ error: 'Failed to get leaderboard', details: err });
  }
});

// Load actual controller logic
const quizController = require('../controllers/quizController');

// GET /quiz - Render quiz page with 10 random questions
router.get('/', quizController.showQuiz);

// POST /quiz/submit - Process EJS form quiz submission
router.post('/submit', quizController.processQuiz);

// POST /quiz/submit-json - Handle fetch() or frontend JS submissions
router.post('/submit-json', quizController.submitScore);

// GET /quiz/review/:attemptId - Show quiz review page for a specific attempt
router.get('/review/:attemptId', quizController.reviewQuiz);

// POST /quiz/start - Start quiz with custom number of questions
router.post('/start', (req, res) => {
  const numQuestions = parseInt(req.body.numQuestions) || 10;

  const allQuestions = JSON.parse(fs.readFileSync('./data/questions.json'));
  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, numQuestions);

  res.render('quiz', { title: 'Quiz Time!', questions: selected });
});

router.get('/review/:attemptId', /* isAuthenticated, */ async (req, res) => {
  try {
      const attemptId = req.params.attemptId;
      const attempt = await QuizAttempt.findById(attemptId)
                                     // .populate('user', 'username'); // Optional: if you want to show username

      if (!attempt) {
          // If no attempt is found with that ID, show an error or a 404 page
          return res.status(404).render('error', { message: 'Quiz attempt not found.' });
          // You'll need an error.ejs view or handle this differently
      }

      // Optional: Check if the logged-in user is authorized to see this attempt
      // if (req.session.user && attempt.user.toString() !== req.session.user._id.toString()) {
      //     return res.status(403).render('error', { message: 'You are not authorized to view this attempt.' });
      // }

      // If found, render the review.ejs template, passing the attempt data to it
      res.render('review', {
          title: 'Review Quiz', // For the <title> tag in your EJS layout
          attempt: attempt      // The actual quiz attempt data
      });

  } catch (err) {
      console.error("Error fetching quiz attempt for review:", err);
      // Render a generic error page or send an error response
      res.status(500).render('error', { message: 'Error loading quiz review.' });
  }
});

module.exports = router;
