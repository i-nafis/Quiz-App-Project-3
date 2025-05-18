// controllers/quizController.js
const axios = require('axios');
const leaderboardController = require('./leaderboardController');
const QuizAttempt = require('../models/QuizAttempt');

const shuffleArray = arr => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

exports.showQuiz = async (req, res) => {
  try {
    // 1) Read amount & category from query‑string (with sane defaults)
    const amount = Math.min(Math.max(parseInt(req.body.numQuestions, 10) || 10,1),50);
    req.session.quizMode = amount;
    const category = req.body.category || '';

    // 2) Build the API URL
    let apiUrl = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;
    if (category) apiUrl += `&category=${encodeURIComponent(category)}`;

    // 2) Fetch from OpenTDB
    const response = await axios.get(apiUrl);
    const results = response.data.results;

    // 3) Transform into your local format
    const questions = results.map((q, idx) => {
      // Combine and shuffle options
      const all = shuffleArray([
        ...q.incorrect_answers,
        q.correct_answer
      ]);

      // Assign letter keys A,B,C,D
      const letters = ['A', 'B', 'C', 'D'];
      const mapped = {};
      let answerKey = '';
      letters.forEach((L, i) => {
        mapped[L] = all[i];
        if (all[i] === q.correct_answer) answerKey = L;
      });

      return {
        id: `q${idx}`,
        question: q.question,
        ...mapped,                    // { A: "...", B: "...", C: "...", D: "..." }
        answer: answerKey,     // letter of the correct one
        options: letters.map(L => mapped[L]),
        optionLetters: letters
      };
    });

    // 4) Store in session and render
    req.session.selectedQuestions = questions;
    res.render('quiz', { title: 'Quiz', questions });
  }
  catch (err) {
    console.error('Error loading trivia questions:', err);
    res.status(500).render('error', { message: 'Could not load quiz questions.' });
  }
};


exports.processQuiz = async (req, res) => {
  const userAnswers = req.body.answers || {};
  const selectedQuestions = req.session.selectedQuestions;

  if (!selectedQuestions) {
    return res.redirect('/quiz');
  }

  // Check if user is logged in
  if (!req.session.user || !req.session.user._id) {
    // Handle not logged in case - you might want to redirect to login
    return res.redirect('/auth/login?redirect=/quiz');
  }

  let score = 0;
  const questionDetails = [];

  // Process each question to calculate score and prepare data for review
  selectedQuestions.forEach((question) => {
    const userAnswerLetter = userAnswers[question.id];
    const isCorrect = userAnswerLetter === question.answer;

    if (isCorrect) score++;

    // Prepare question details for the attempt model
    questionDetails.push({
      questionText: question.question,
      options: question.options,
      userAnswer: userAnswerLetter ? question[userAnswerLetter] : "Not Answered",
      correctAnswer: question[question.answer],
      isCorrect: isCorrect
    });
  });

  try {
    // Save the quiz attempt to the database
    const newAttempt = new QuizAttempt({
      user: req.session.user._id,
      questions: questionDetails,
      score: score,
      mode: req.session.quizMode
    });

    const savedAttempt = await newAttempt.save();

    // Update leaderboard if necessary
    leaderboardController.addScore(req.session.user.username, score, req.session.quizMode);

    // Clean up session
    delete req.session.selectedQuestions;

    // Render results page with attempt ID for review link
    res.render('results', {
      title: 'Quiz Results',
      score,
      total: selectedQuestions.length,
      attemptId: savedAttempt._id
    });
  } catch (err) {
    console.error("Error saving quiz attempt:", err);
    res.status(500).render('error', { message: 'Error saving quiz results' });
  }
};

exports.showQuizForm = async (req, res) => {
  try {
    const { data } = await axios.get('https://opentdb.com/api_category.php');
    res.render('index', {
      categories: data.trivia_categories,
      user: req.session.user
    });
  } catch (err) {
    console.error('Error loading categories:', err);
    res.status(500).render('error', { message: 'Could not load quiz categories.' });
  }
};

exports.submitScore = async (req, res) => {
  const { score, questions } = req.body;

  // Ensure user is logged in
  if (!req.session.user || !req.session.user._id) {
    return res.status(401).json({ message: "You must be logged in to submit a score." });
  }

  try {
    // Create a quiz attempt record with questions if provided
    const newAttempt = new QuizAttempt({
      user: req.session.user._id,
      questions: questions || [], // Use provided questions or empty array
      score: score,
      mode: req.session.quizMode
    });

    const savedAttempt = await newAttempt.save();

    // Update leaderboard
    leaderboardController.addScore(req.session.user.username, score, req.session.quizMode);

    res.status(200).json({
      message: "Score submitted successfully",
      attemptId: savedAttempt._id
    });
  } catch (err) {
    console.error("Error saving score:", err);
    res.status(500).json({ message: "Error saving score" });
  }
};

// Updated reviewQuiz function
exports.reviewQuiz = async (req, res) => {
  try {
    const attemptId = req.params.attemptId;
    const attempt = await QuizAttempt.findById(attemptId);

    if (!attempt) {
      return res.status(404).render('error', { message: 'Quiz attempt not found' });
    }

    // Simple authorization check - only allow users to view their own attempts
    if (req.session.user && attempt.user.toString() !== req.session.user._id.toString()) {
      return res.status(403).render('error', { message: 'You do not have permission to view this quiz attempt' });
    }

    // The attempt object already has the questions array with all the needed info
    // from how you structured it in processQuiz
    // We just need to make sure it's passed correctly to the template

    res.render('review', {
      title: 'Quiz Review',
      attempt: attempt
    });
  } catch (err) {
    console.error("Error retrieving quiz attempt:", err);
    res.status(500).render('error', { message: 'Error loading quiz review' });
  }
};
