const leaderboardController = require('./leaderboardController'); // ✅ Only once at the top

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

  const selectedQuestions = getRandomQuestions(allQuestions, 10).map((q, index) => ({
    ...q,
    id: `q${index}`
  }));

  req.session.selectedQuestions = selectedQuestions;

  res.render('quiz', {
    title: 'Quiz',
    questions: selectedQuestions
  });
};

exports.processQuiz = (req, res) => {
  const userAnswers = req.body.answers || {};
  const selectedQuestions = req.session.selectedQuestions;

  if (!selectedQuestions) return res.redirect('/quiz');

  let score = 0;
  const results = [];

  selectedQuestions.forEach((question) => {
    const userAnswer = userAnswers[question.id];
    const isCorrect = userAnswer === question.answer;

    if (isCorrect) score++;

    results.push({
      question: question.question,
      correctLetter: question.answer,
      correctAnswerText: question[question.answer],
      userAnswerLetter: userAnswer,
      userAnswerText: question[userAnswer],
      isCorrect
    });
  });

  if (req.session.user && req.session.user.username) {
    console.log("✅ Submitting score to leaderboard:", req.session.user.username, score);
    leaderboardController.addScore(req.session.user.username, score);
  } else {
    console.log("⚠️ No user in session — score not submitted");
  }

  delete req.session.selectedQuestions;

  res.render('results', {
    title: 'Quiz Results',
    score,
    total: selectedQuestions.length,
    results
  });
};

//  route: score submission via fetch (JSON)
exports.submitScore = (req, res) => {
  const { score } = req.body;

  if (!req.session.user || !req.session.user.username) {
    return res.status(401).send("You must be logged in to submit score.");
  }

  const username = req.session.user.username;
  leaderboardController.addScore(username, score);

  res.send("Score submitted and stored.");
};
