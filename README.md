# Quiz App 🧠

An interactive quiz application built with Node.js, Express, and EJS. Users can sign up, log in, and take quizzes. Their progress is saved, and scores are displayed on a leaderboard.

---

## 🚀 Features

- 🔐 User Authentication (Sign Up / Login)
- 🔑 Passwords securely hashed using bcrypt
- 🧾 Dynamic Quiz Questions from JSON
- 📊 Leaderboard to track high scores
- 🖼️ Clean UI with EJS templating
- 🧩 Modular code structure with routes, controllers, and middleware
- 🌓Dark/Light Mode

---

## 📂 Project Structure
```plaintext
bin/        # Executable scripts
routes/     # Express route definitions
controllers/ # Logic handling route requests
middleware/ # Express middleware functions
data/       # JSON data files
views/      # EJS template files
public/     # Static files (CSS, JS, images)
```

---

## 🛠️ Installation & Running the App

**Clone the repository**
   ```bash
   git clone https://github.com/i-nafis/CSCI355-Project-2
```
**Install dependencies**  
   ```bash
   npm install
```
**Run the application**
```bash
  node bin/www
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

## 📝 License

This project is for academic purposes only. All rights reserved by the team.

---

## 💡 Future Improvements

- Add admin dashboard to manage questions  
- Quiz history  
- Add categories and difficulty levels for quizzes  
- Connect to a real database (MongoDB)
