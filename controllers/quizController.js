// Updated quizController.js - Add quiz review functionality

const leaderboardController = require('./leaderboardController');
const QuizAttempt = require('../models/QuizAttempt'); // Import the QuizAttempt model

/**
 * Fisher-Yates Shuffle for selecting random questions
 */
const getRandomQuestions = (questions, num) => {
  const shuffled = questions.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, num);
};

exports.showQuiz = (req, res) => {
  const allQuestions = req.app.locals.quizQuestions;

  // Prepare questions with option arrays for easier review later
  const selectedQuestions = getRandomQuestions(allQuestions, 10).map((q, index) => {
    // Create an options array from properties A, B, C, D
    const optionLetters = Object.keys(q).filter(key => /^[A-Z]$/.test(key) && key !== 'answer');
    const options = optionLetters.map(letter => q[letter]);

    return {
      ...q,
      id: `q${index}`, // ID for form processing
      options: options, // Store options as array for review
      optionLetters: optionLetters // Store option letters for reference
    };
  });

  // Store selected questions in session for processing submissions
  req.session.selectedQuestions = selectedQuestions;

  res.render('quiz', {
    title: 'Quiz',
    questions: selectedQuestions
  });
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
      score: score
    });

    const savedAttempt = await newAttempt.save();

    // Update leaderboard if necessary
    leaderboardController.addScore(req.session.user.username, score);

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

exports.submitScore = async (req, res) => {
  const { score } = req.body;

  // Ensure user is logged in
  if (!req.session.user || !req.session.user._id) {
    return res.status(401).json({ message: "You must be logged in to submit a score." });
  }

  try {
    // Create a basic quiz attempt record without detailed questions
    const newAttempt = new QuizAttempt({
      user: req.session.user._id,
      questions: [], // No detailed questions for client-side submissions
      score: score
    });
    
    const savedAttempt = await newAttempt.save();
    
    // Update leaderboard
    leaderboardController.addScore(req.session.user.username, score);

    res.status(200).json({ 
      message: "Score submitted successfully", 
      attemptId: savedAttempt._id 
    });
  } catch (err) {
    console.error("Error saving score:", err);
    res.status(500).json({ message: "Error saving score" });
  }
};

// New controller function to handle quiz review requests
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

    res.render('review', {
      title: 'Quiz Review',
      attempt: attempt
    });
  } catch (err) {
    console.error("Error retrieving quiz attempt:", err);
    res.status(500).render('error', { message: 'Error loading quiz review' });
  }
};