let currentQuestionIndex = 0;
let score = 0;

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

  // Display question text
  document.getElementById('question').textContent = question.question;

  // Display choices
  document.getElementById('choiceA').textContent = question.A;
  document.getElementById('choiceB').textContent = question.B;
  document.getElementById('choiceC').textContent = question.C;
  document.getElementById('choiceD').textContent = question.D;

  // Attach click handlers
  document.querySelectorAll('.choice-text').forEach(choice => {
    choice.onclick = () => handleAnswer(choice.dataset.choice);
  });

  // Progress UI
  document.getElementById('progressText').textContent =
    `Question ${currentQuestionIndex + 1} of ${quizData.length}`;

  document.getElementById('progressBarFull').style.width =
    `${((currentQuestionIndex + 1) / quizData.length) * 100}%`;
}

function handleAnswer(selectedLetter) {
  const correct = quizData[currentQuestionIndex].answer;
  if (selectedLetter === correct) {
    score++;
    document.getElementById('score').textContent = score;
  }

  currentQuestionIndex++;
  showQuestion();
}

function submitScoreAndRedirect(score) {
  const messageContainer = document.getElementById('question');
  messageContainer.textContent = `🎉 You got ${score} out of ${quizData.length} correct!`;

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
    })
    .finally(() => {
      // Add a short delay so the user sees the score
      setTimeout(() => {
        console.log("➡️ Redirecting to leaderboard...");
        window.location.href = '/leaderboard';
      }, 2500); // 2.5 seconds
    });
}




