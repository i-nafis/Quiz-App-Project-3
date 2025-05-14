// routes/quiz.js
// -------------------------------------
// Defines quiz-related routes: quiz page, submission, and score submission.
// Uses real controller logic from controllers/quizController.js.
// -------------------------------------

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs'); // New require statement
const User = require('./models/User'); // Import User model
const Score = require('./models/Score'); // Import Score model

const app = express();

// Ensure MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error: ', err));

// Route for registering a new user
app.post('/register', async (req, res) => {
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

app.listen(3000, () => console.log('Server running on http://localhost:3000'));

const Score = require('./models/Score'); // Import the Score model

// Save user's score
app.post('/submit-score', async (req, res) => {
  const { userId, score } = req.body; // Assume userId and score are sent in the request body

  try {
    // Create a new score document
    const newScore = new Score({
      score,
      user: userId,
    });

    // Save the score
    await newScore.save();

    // Add the score to the user's scores array
    const user = await User.findById(userId);
    user.scores.push(newScore._id);
    await user.save();

    res.status(200).json({ message: 'Score saved successfully!' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to save score', details: err });
  }
});

// Create and populate leaderboard
app.get('/leaderboard', async (req, res) => {
  try {
    const topScores = await Score.find()
      .sort({ score: -1 }) // Sort by score in descending order
      .limit(10)
      .populate('user', 'username'); // Populate the 'user' field with the username

    res.status(200).json(topScores);
  } catch (err) {
    res.status(400).json({ error: 'Failed to get leaderboard', details: err });
  }
});



// ✅ Load actual controller logic
const quizController = require('../controllers/quizController');

// ✅ GET /quiz - Render quiz page with 10 random questions
router.get('/', quizController.showQuiz);

// ✅ POST /quiz/submit - Process EJS form quiz submission
router.post('/submit', quizController.processQuiz);

// ✅ POST /quiz/submit-json - Handle fetch() or frontend JS submissions
router.post('/submit-json', quizController.submitScore);

// ✅ POST /quiz/start - Start quiz with custom number of questions
router.post('/start', (req, res) => {
  const numQuestions = parseInt(req.body.numQuestions) || 10;

  const allQuestions = JSON.parse(fs.readFileSync('./data/questions.json'));
  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, numQuestions);

  res.render('quiz', { title: 'Quiz Time!', questions: selected });
});

module.exports = router;
