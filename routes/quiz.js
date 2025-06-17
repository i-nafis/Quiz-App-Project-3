// routes/quiz.js
// -------------------------------------
// Quiz routes: pick #/category, fetch questions, submit, and review
// -------------------------------------
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  showQuizForm,
  showQuiz,
  processQuiz,
  submitScore,
  reviewQuiz
} = require('../controllers/quizController');

// ——— Async wrapper so errors go to your error handler ———
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ——— Protect every quiz route ———
router.use(authMiddleware.requireAuth);

// 1) GET  /quiz
router.get('/', asyncHandler(showQuizForm));

// 2) POST /quiz/start
router.post('/start', asyncHandler(showQuiz));

// 3) POST /quiz/submit
router.post('/submit', asyncHandler(processQuiz));

// 4) POST /quiz/submit-json
router.post('/submit-json', asyncHandler(submitScore));

// 5) GET  /quiz/review/:attemptId
router.get('/review/:attemptId', asyncHandler(reviewQuiz));

module.exports = router;
