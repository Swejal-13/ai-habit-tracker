import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Layout      from './components/common/Layout';
import LoginPage   from './pages/LoginPage';
import SignupPage  from './pages/SignupPage';
import Dashboard   from './pages/Dashboard';
import HabitsPage  from './pages/HabitsPage';
import TasksPage   from './pages/TasksPage';
import Analytics   from './pages/Analytics';
import AICoach     from './pages/AICoach';
import DailyPlanner from './pages/DailyPlanner';
import PomodoroPage from './pages/PomodoroPage';
import FriendsPage  from './pages/FriendsPage';
import AchievementsPage from './pages/AchievementsPage';
import ProfilePage  from './pages/ProfilePage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-bg">
      <div className="text-accent text-lg font-heading animate-pulse">HabitFlow…</div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1a1a24', color: '#f0f0f5', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'DM Sans, sans-serif', fontSize: '13.5px' },
            success: { iconTheme: { primary: '#3dd68c', secondary: '#0d0d12' } },
            error:   { iconTheme: { primary: '#ff5f5f', secondary: '#0d0d12' } },
          }}
        />
        <Routes>
          <Route path="/login"  element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index        element={<Dashboard />} />
            <Route path="habits"       element={<HabitsPage />} />
            <Route path="tasks"        element={<TasksPage />} />
            <Route path="analytics"    element={<Analytics />} />
            <Route path="ai-coach"     element={<AICoach />} />
            <Route path="planner"      element={<DailyPlanner />} />
            <Route path="pomodoro"     element={<PomodoroPage />} />
            <Route path="friends"      element={<FriendsPage />} />
            <Route path="achievements" element={<AchievementsPage />} />
            <Route path="profile"      element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
