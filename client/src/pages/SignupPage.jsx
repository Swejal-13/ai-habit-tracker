import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      toast.success('Account created! Welcome to HabitFlow 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 font-heading text-3xl font-extrabold text-accent-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_10px_rgba(124,106,247,0.8)]"></span>
            HabitFlow
          </div>
          <p className="text-white/40 text-lg">Start building better habits today</p>
        </div>

        <div className="bg-bg-2 border border-white/[0.08] rounded-2xl p-8">
          <h1 className="font-heading text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-white/40 text-lg mb-6">Free forever. No credit card needed.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label text-lg">Full Name</label>
              <input
                required
                placeholder="Jordan Davis"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label text-lg">Email</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label text-lg">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 chars"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label text-lg">Confirm</label>
                <input
                  type="password"
                  required
                  placeholder="Repeat password"
                  value={form.confirm}
                  onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full justify-center py-2.5 text-xl mt-2"
            >
              {loading ? 'Creating account…' : 'Get Started Free →'}
            </button>
          </form>

          <p className="text-center text-lg text-white/40 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-2 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
