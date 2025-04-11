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
  // Clear any existing timers
  clearInterval(countdown);
  clearInterval(timerInterval);
  
  timeLeft = totalTime;
  let startTime = new Date().getTime();
  let endTime = startTime + (totalTime * 1000);
  
  updateTimerDisplay();
  
  // Initialize progress bar width to 0%
  document.getElementById("progressBarFull").style.width = '0%';
  
  // Set up the countdown for second-based display updates
  countdown = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    
    if (timeLeft <= 0) {
      clearInterval(countdown);
      clearInterval(timerInterval);
      currentQuestionIndex++;
      showQuestion();
    }
  }, 1000);
  
  // Set up the smooth progress bar animation
  timerInterval = setInterval(() => {
    let currentTime = new Date().getTime();
    let elapsedTime = currentTime - startTime;
    let remainingTime = endTime - currentTime;
    
    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      document.getElementById("progressBarFull").style.width = '100%';
      return;
    }
    
    // Calculate progress percentage with higher precision
    const progressPercentage = (elapsedTime / (totalTime * 1000)) * 100;
    document.getElementById("progressBarFull").style.width = `${progressPercentage}%`;
    
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
  if (selectedLetter === correct) {
    score++;
    document.getElementById("score").textContent = score;
  }

  // Stop all timers when user answers
  clearInterval(countdown);
  clearInterval(timerInterval);
  
  currentQuestionIndex++;
  showQuestion();
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
    return "Perfect score! Excellent work!";
  } else if (percentage >= 80) {
    return "Well done, you did a great job!";
  } else if (percentage >= 50) {
    return "Not bad, but you need to know more.";
  } else {
    return "Better luck next time! Keep studying and try again.";
  }
}