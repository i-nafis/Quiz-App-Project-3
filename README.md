# Quiz App 🧠 (Upgraded Version)

> **Note:** This is an upgraded version of our old Quiz App—it now integrates with a Trivia API and uses MongoDB for data storage.

An interactive quiz application built with Node.js, Express, and EJS. Users can sign up, log in, and take quizzes. Their progress is saved in MongoDB, and scores are displayed on a real-time leaderboard.

---

## 🚀 Features

- 🔐 User Authentication (Sign Up / Login)
- 🔑 Passwords securely hashed using bcrypt
- 🎲 Dynamic Quiz Questions fetched from a Trivia API
- 📊 Real-time Leaderboard powered by MongoDB
- 🖼️ Clean UI with EJS templating
- 🧩 Modular code structure with routes, controllers, and middleware
- 🌓 Dark/Light Mode

### 🧠 Gameplay Enhancements

- ⏱️ Countdown Timer per Question
- ✅ Answer validation with visual feedback (Correct = green | Incorrect = red)
- 🎉 Confetti animation on correct answers (Canvas Confetti)
- 🌈 Glowing animation effect for correct selections
- 🔁 Auto-next question after selection
- 📥 Question count selector before quiz start

---


## 📂 Project Structure
```plaintext
bin/         # Executable scripts
routes/      # Express route definitions
controllers/ # Business logic for routes
middleware/  # Express middleware functions
models/      # Mongoose schemas & models
data/        # Static JSON files (fallback questions)
views/       # EJS template files
public/      # Static assets (CSS, JS, images)
```

---

## 🛠️ Installation & Running the App

**Clone the repository**
   ```bash
   git clone https://github.com/jess-icaww/Quiz-App-Project-3.git
```
**Install dependencies**  
   ```bash
   npm install
```
**Run the application**
```bash
node start
```
**Open in browser**
```bash
http://localhost:3000
```
## 👥 Team Members

- Castillo, Abraham  
- Islam, Nafisul  
- Rahi, Mst  
- Wong, Jessica  

---

## 🌐 Deployment

🔗 **Live App**: [https://quiz.afk.ac](https://quiz.afk.ac)

---


## 📝 License

This project is for academic purposes only. All rights reserved by the team.

---
