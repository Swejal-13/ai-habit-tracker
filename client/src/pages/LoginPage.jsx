import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 font-heading text-3xl font-extrabold text-accent-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_10px_rgba(124,106,247,0.8)]"></span>
            HabitFlow
          </div>
          <p className="text-white/40 text-lg">Your AI-powered productivity companion</p>
        </div>

        {/* Card */}
        <div className="bg-bg-2 border border-white/[0.08] rounded-2xl p-8">
          <h1 className="font-heading text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-white/40 text-sm mb-6">Sign in to continue your streak</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label text-lg">Email</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="py-3"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="form-group mb-6">
              <label className="form-label text-lg">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="py-3"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full justify-center py-3 text-xl"
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <p className="text-center text-lg text-white/40 mt-5">
            No account?{' '}
            <Link to="/signup" className="text-accent-2 hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
