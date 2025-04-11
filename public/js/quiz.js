let currentQuestionIndex = 0;
let score = 0;
let countdown;
let timerInterval;
let timeLeft = 15;
const totalTime = 15; // Define the total time for reference
const updateFrequency = 50; // Update every 50ms timer bar

document.addEventListener("DOMContentLoaded", () => {
  showQuestion();
});

function showQuestion() {
  const question = quizData[currentQuestionIndex];

  if (!question) {
    // Quiz finished — submit score to server
    submitScoreAndRedirect(score);
    return;
  }

  // Reset and start the timer
  resetTimer();

  // Display question text
  document.getElementById("question").textContent = question.question;

  // Display choices
  document.getElementById("choiceA").textContent = question.A;
  document.getElementById("choiceB").textContent = question.B;
  document.getElementById("choiceC").textContent = question.C;
  document.getElementById("choiceD").textContent = question.D;

  // Attach click handlers to each choice
  document.querySelectorAll(".choice-text").forEach((choice) => {
    choice.onclick = () => handleAnswer(choice.dataset.choice);
  });

  // Update the progress UI - showing question number
  document.getElementById("progressText").textContent = `Question ${
    currentQuestionIndex + 1
  } of ${quizData.length}`;
  
  // Reset progress bar at the start of each question
  document.getElementById("progressBarFull").style.width = '0%';
}

function resetTimer() {
  clearInterval(countdown);
  clearInterval(timerInterval);

  timeLeft = totalTime;
  const countdownEl = document.getElementById("countdown");
  const progressBar = document.getElementById("progressBarFull");

  const startTime = new Date().getTime();
  const endTime = startTime + totalTime * 1000;

  // Updates the numeric countdown every second
  countdown = setInterval(() => {
    const now = new Date().getTime();
    const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
    countdownEl.textContent = remaining;

    if (remaining <= 0) {
      clearInterval(countdown);
    }
  }, 1000);

  // Smooth progress bar shrink
  timerInterval = setInterval(() => {
    const now = new Date().getTime();
    const remainingTime = endTime - now;

    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      handleAnswer(null); // auto skip if time runs out
      return;
    }

    const percent = (remainingTime / (totalTime * 1000)) * 100;
    progressBar.style.width = `${percent}%`;
  }, updateFrequency);
}

function updateTimerDisplay() {
  const timerDisplay = document.getElementById('timer');
  if (timerDisplay) {
    timerDisplay.textContent = timeLeft;
  }
}

function handleAnswer(selectedLetter) {
  const correct = quizData[currentQuestionIndex].answer;
  const choices = document.querySelectorAll(".choice-text");

  // Stop all timers
  clearInterval(countdown);
  clearInterval(timerInterval);

  // Disable further clicking
  choices.forEach(choice => {
    choice.onclick = null;
  });

  // Highlight selected and correct answers
  choices.forEach(choice => {
    const choiceLetter = choice.dataset.choice;
  
    if (choiceLetter === correct) {
      choice.parentElement.classList.add("correct");
    }

    if (choiceLetter === selectedLetter && choiceLetter !== correct) {
      choice.parentElement.classList.add("incorrect");
    }
  });

  const feedback = document.getElementById("feedback");

  if (selectedLetter === correct) {
    score++;
    document.getElementById("score").textContent = score;
    triggerConfetti();
  }

  // 🧼 Reset colors before showing next question
  setTimeout(() => {
    feedback.textContent = "";

    // Remove .correct and .incorrect from the full choice container
    choices.forEach(choice => {
      const container = choice.parentElement;
      container.classList.remove("correct", "incorrect");
    });

    currentQuestionIndex++;
    showQuestion();
  }, 2000);
}

function triggerConfetti() {
  const confetti = document.getElementById("confetti");
  confetti.style.display = "block";
  confetti.innerHTML = "🎉🎉🎉";

  setTimeout(() => {
    confetti.style.display = "none";
    confetti.innerHTML = "";
  }, 1000);
}

function submitScoreAndRedirect(score) {
  fetch('/quiz/submit-json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ score })
  })
    .then((res) => res.text())
    .then((data) => {
      console.log("✅ Score submitted:", data);
    })
    .catch((err) => {
      console.error("❌ Error submitting score:", err);
    });

  const feedback = getFeedbackMessage(score, quizData.length);

  const gameContainer = document.getElementById('game');
  gameContainer.innerHTML = `
    <div class="results-popup">
      <h2>Results are in!</h2>
      <p>🎉 You got ${score} out of ${quizData.length} correct!</p>
      <p class="feedback">${feedback}</p>
    <div class="action-buttons">
      <a href="/quiz" class="btn play-btn">
        <i class="fas fa-play-circle"></i> Play Again
      </a>
      <a href="/leaderboard" class="btn secondary-btn">
          <i class="fas fa-trophy"></i> Leaderboard
      </a>
    </div>
    </div>
  `;
}

function getFeedbackMessage(score, total) {
  const percentage = (score / total) * 100;

  if (percentage === 100) {
    return "🎉 Genius alert! Did Google call asking for their answers back?";
  } else if (percentage >= 80) {
    return "🚀 Awesome job! You've clearly done your homework—or guessed really well!";
  } else if (percentage >= 50) {
    return "😅 Halfway there! Your brain called—it wants a rematch.";
  } else {
    return "🤷‍♂️ Oops! Did the quiz catch you napping? Wake up and try again!";
  }
}

