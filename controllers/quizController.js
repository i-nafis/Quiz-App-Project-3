// controllers/quizController.js
const axios = require('axios');
const { addScore } = require('./leaderboardController');
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
    const amount = Math.min(Math.max(parseInt(req.body.numQuestions, 10) || 10, 1), 50);
    req.session.quizMode = amount;
    const category = req.body.category || '';

    let apiUrl = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;
    if (category) apiUrl += `&category=${encodeURIComponent(category)}`;

    const response = await axios.get(apiUrl);
    const results = response.data.results;

    const questions = results.map((q, idx) => {
      const all = shuffleArray([ ...q.incorrect_answers, q.correct_answer ]);
      const letters = ['A','B','C','D'];
      const mapped = {};
      let answerKey = '';

      letters.forEach((L,i) => {
        mapped[L] = all[i];
        if (all[i] === q.correct_answer) answerKey = L;
      });

      return {
        id: `q${idx}`,
        question: q.question,
        ...mapped,
        answer: answerKey,
        options: letters.map(L => mapped[L]),
        optionLetters: letters
      };
    });

    req.session.selectedQuestions = questions;
    res.render('quiz', { title: 'Quiz', questions });
  } catch (err) {
    console.error('Error loading trivia questions:', err);
    res.status(500).render('error', { message: 'Could not load quiz questions.' });
  }
};

exports.processQuiz = async (req, res) => {
  const userAnswers = req.body.answers || {};
  const selectedQuestions = req.session.selectedQuestions;
  if (!selectedQuestions) return res.redirect('/quiz');
  if (!req.session.user || !req.session.user._id) {
    return res.redirect('/auth/login?redirect=/quiz');
  }

  let score = 0;
  const questionDetails = [];

  selectedQuestions.forEach(question => {
    const letter = userAnswers[question.id];
    const isCorrect = letter === question.answer;
    if (isCorrect) score++;
    questionDetails.push({
      questionText:  question.question,
      options:       question.options,
      userAnswer:    letter ? question[letter] : 'Not Answered',
      correctAnswer: question[question.answer],
      isCorrect
    });
  });

  try {
    const newAttempt = new QuizAttempt({
      user:      req.session.user._id,
      questions: questionDetails,
      score,
      mode:      req.session.quizMode
    });
    const saved = await newAttempt.save();

    // **Fixed leaderboard call**: pass userId and await
    await addScore(req.session.user._id, score, req.session.quizMode);

    delete req.session.selectedQuestions;
    res.render('results', {
      title:    'Quiz Results',
      score,
      total:    selectedQuestions.length,
      attemptId: saved._id
    });
  } catch (err) {
    console.error('Error saving quiz attempt:', err);
    res.status(500).render('error', { message: 'Error saving quiz results' });
  }
};

exports.showQuizForm = async (req, res) => {
  try {
    const { data } = await axios.get('https://opentdb.com/api_category.php');
    res.render('index', {
      categories: data.trivia_categories,
      user:       req.session.user
    });
  } catch (err) {
    console.error('Error loading categories:', err);
    res.status(500).render('error', { message: 'Could not load quiz categories.' });
  }
};

exports.submitScore = async (req, res) => {
  const { score, questions } = req.body;
  if (!req.session.user || !req.session.user._id) {
    return res.status(401).json({ message: 'You must be logged in to submit a score.' });
  }

  try {
    const newAttempt = new QuizAttempt({
      user:      req.session.user._id,
      questions: questions || [],
      score,
      mode:      req.session.quizMode
    });
    const saved = await newAttempt.save();

    // **Fixed leaderboard call** here as well
    await addScore(req.session.user._id, score, req.session.quizMode);

    res.status(200).json({
      message:   'Score submitted successfully',
      attemptId: saved._id
    });
  } catch (err) {
    console.error('Error saving score:', err);
    res.status(500).json({ message: 'Error saving score' });
  }
};

exports.reviewQuiz = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.attemptId);
    if (!attempt) {
      return res.status(404).render('error', { message: 'Quiz attempt not found' });
    }
    if (attempt.user.toString() !== req.session.user._id) {
      return res.status(403).render('error', { message: 'No permission to view this attempt' });
    }
    res.render('review', {
      title:   'Quiz Review',
      attempt
    });
  } catch (err) {
    console.error('Error retrieving quiz attempt:', err);
    res.status(500).render('error', { message: 'Error loading quiz review' });
  }
};
