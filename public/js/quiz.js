let currentQuestionIndex = 0;
let score = 0;
let countdown;
let timeLeft = 15;

document.addEventListener('DOMContentLoaded', () => {
  showQuestion();
});

function showQuestion() {
  const question = quizData[currentQuestionIndex];

  if (!question) {
    // ✅ Quiz finished — submit score to server
    submitScoreAndRedirect(score);
    return;
  }

  // Reset and start the timer
  resetTimer();

  // Display question text
  document.getElementById('question').textContent = question.question;

  // Display choices
  document.getElementById('choiceA').textContent = question.A;
  document.getElementById('choiceB').textContent = question.B;
  document.getElementById('choiceC').textContent = question.C;
  document.getElementById('choiceD').textContent = question.D;

  // Attach click handlers to each choice
  document.querySelectorAll('.choice-text').forEach(choice => {
    choice.onclick = () => handleAnswer(choice.dataset.choice);
  });

  // Update the progress UI
  document.getElementById('progressText').textContent =
    `Question ${currentQuestionIndex + 1} of ${quizData.length}`;

  document.getElementById('progressBarFull').style.width =
    `${((currentQuestionIndex + 1) / quizData.length) * 100}%`;
}

function resetTimer() {
  clearInterval(countdown);
  timeLeft = 15;
  updateTimerDisplay();

  countdown = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(countdown);
      currentQuestionIndex++;
      showQuestion();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerDisplay = document.getElementById('timer');
  if (timerDisplay) {
    timerDisplay.textContent = timeLeft;
  }
}

function handleAnswer(selectedLetter) {
  const correct = quizData[currentQuestionIndex].answer;
  if (selectedLetter === correct) {
    score++;
    document.getElementById('score').textContent = score;
  }

  clearInterval(countdown); // Stop the timer when user answers
  currentQuestionIndex++;
  showQuestion();
}

function submitScoreAndRedirect(score) {
  fetch('/quiz/submit-json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ score })
  })
    .then(res => res.text())
    .then(data => {
      console.log("✅ Score submitted:", data);
    })
    .catch(err => {
      console.error("❌ Error submitting score:", err);
    });

  const feedback = getFeedbackMessage(score, quizData.length);

  const gameContainer = document.getElementById('game');
  gameContainer.innerHTML = `
    <div class="results-popup">
      <h2>Quiz Completed!</h2>
      <p>🎉 You got ${score} out of ${quizData.length} correct!</p>
      <p class="feedback">${feedback}</p>
      <div class="actions">
        <a href="/quiz" class="btn">Play Again</a>
        <a href="/leaderboard" class="btn">Leaderboard</a>
      </div>
    </div>
  `;
}

function getFeedbackMessage(score, total) {
  const percentage = (score / total) * 100;
  if (percentage === 100) {
    return "Perfect score! Excellent work!";
  } else if (percentage >= 80) {
    return "Well done, you did a great job!";
  } else if (percentage >= 50) {
    return "Not bad, but you need to know more.";
  } else {
    return "Better luck next time! Keep studying and try again.";
  }
}