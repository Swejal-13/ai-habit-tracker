# 🚀 HabitFlow – AI-Powered Habit Tracker (MERN Stack)

A full-stack SaaS-based habit tracking application designed to help users build consistency, track progress, and gain insights using analytics.

# 📌 Overview

HabitFlow is a modern habit tracking platform built using the MERN stack (MongoDB, Express, React, Node.js).
It enables users to create, manage, and analyze their daily habits with an intuitive dashboard and real-time updates.
## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, React Router v6   |
| Charts     | Chart.js + react-chartjs-2                      |
| Backend    | Node.js, Express.js                             |
| Database   | MongoDB + Mongoose                              |
| Auth       | JWT + bcryptjs                                  |
| AI         | OpenAI SDK (works with Anthropic/OpenAI)        |
| File Upload| Multer                                          |
| Cron Jobs  | node-cron                                       |
| Security   | Helmet, express-rate-limit, CORS                |

---

## Project Structure

```
habit-tracker/
├── server/
│   ├── index.js                 # Express entry point
│   ├── controllers/
│   │   ├── authController.js    # Signup, login, JWT
│   │   ├── habitController.js   # CRUD + streaks + completions
│   │   ├── taskController.js    # Task management
│   │   ├── analyticsController.js # Dashboard + charts data
│   │   ├── aiController.js      # All AI features
│   │   ├── profileController.js # Profile + avatar upload
│   │   └── friendsController.js # Social features
│   ├── models/
│   │   ├── User.js
│   │   ├── Habit.js
│   │   ├── Task.js
│   │   └── FocusSession.js
│   ├── routes/
│   │   ├── auth.js / habits.js / tasks.js
│   │   ├── analytics.js / ai.js / profile.js
│   │   ├── friends.js / search.js
│   ├── middleware/
│   │   ├── auth.js              # JWT protect middleware
│   │   └── upload.js            # Multer config
│   └── services/
│       └── cronService.js       # Scheduled reminders
├── client/
│   ├── src/
│   │   ├── App.jsx              # Router + providers
│   │   ├── context/AuthContext.jsx
│   │   ├── hooks/useHabits.js
│   │   ├── utils/api.js         # Axios instance
│   │   ├── components/
│   │   │   ├── common/Layout.jsx + StatCard.jsx
│   │   │   ├── habits/HabitItem.jsx + HabitModal.jsx
│   │   │   └── analytics/Heatmap.jsx
│   │   └── pages/
│   │       ├── LoginPage.jsx / SignupPage.jsx
│   │       ├── Dashboard.jsx / HabitsPage.jsx
│   │       ├── TasksPage.jsx / Analytics.jsx
│   │       ├── AICoach.jsx / DailyPlanner.jsx
│   │       ├── PomodoroPage.jsx / FriendsPage.jsx
│   │       ├── AchievementsPage.jsx / ProfilePage.jsx
├── uploads/                     # Avatar images (git-ignored)
├── .env.example
└── package.json
```

---

## Quick Start

### 1. Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- An AI API key (Anthropic or OpenAI)

### 2. Clone & install dependencies

```bash
git clone <your-repo>
cd habit-tracker

# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install && cd ..
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGO_URI=mongodb_url_here
JWT_SECRET=your_very_secret_key_min_32_chars
JWT_EXPIRE=7d

Gemini_api_key=gemini_api_key_here

```

### 4. Run in development

```bash
# Option A: Run backend + frontend together
npm run dev:full

# Option B: Run separately
npm run dev          # Backend on :5000
cd client && npm run dev  # Frontend on :5173
```


---


## Features Checklist

- [x] JWT Authentication (signup/login/logout)
- [x] Habit CRUD with emoji picker
- [x] Automatic streak tracking
- [x] Daily/weekly/monthly/yearly habits
- [x] Task manager with priorities
- [x] Analytics dashboard with 4 chart types
- [x] GitHub-style activity heatmap
- [x] Productivity score algorithm
- [x] Achievement badges (12 badges)
- [x] AI Productivity Coach (chat)
- [x] AI Habit Plan Generator
- [x] AI Daily Planner
- [x] AI Weekly Report
- [x] Pomodoro focus timer with analytics
- [x] Friends & leaderboard
- [x] Global search (Ctrl+K)
- [x] Profile with avatar upload
- [x] Cron-based reminders
- [x] Rate limiting & security headers
- [x] PWA manifest
- [x] Responsive design

---
