// routes/quiz.js
// -------------------------------------
// Quiz routes only: pick #/category, fetch questions, submit, and review
// -------------------------------------
const express        = require('express');
const router         = express.Router();
const quizController = require('../controllers/quizController');

// 1) GET  /quiz           → show form (number + category)
router.get('/', quizController.showQuizForm);

// 2) POST /quiz/start     → fetch from OpenTDB & render quiz
router.post('/start', quizController.showQuiz);

// 3) POST /quiz/submit    → grade, save attempt & render results
router.post('/submit', quizController.processQuiz);

// 4) POST /quiz/submit-json → grade/save via JSON (if you use fetch)
router.post('/submit-json', quizController.submitScore);

// 5) GET  /quiz/review/:attemptId → review a past attempt
router.get('/review/:attemptId', quizController.reviewQuiz);


module.exports = router;
