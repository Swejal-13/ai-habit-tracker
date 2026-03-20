import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export function useHabits() {
  const [habits, setHabits]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchHabits = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const { data } = await api.get('/habits', { params });
      setHabits(data.habits);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  const createHabit = useCallback(async (payload) => {
    const { data } = await api.post('/habits', payload);
    setHabits(prev => [data.habit, ...prev]);
    toast.success('Habit created!');
    return data.habit;
  }, []);

  const updateHabit = useCallback(async (id, payload) => {
    const { data } = await api.put(`/habits/${id}`, payload);
    setHabits(prev => prev.map(h => h._id === id ? data.habit : h));
    toast.success('Habit updated');
    return data.habit;
  }, []);

  const deleteHabit = useCallback(async (id) => {
    await api.delete(`/habits/${id}`);
    setHabits(prev => prev.filter(h => h._id !== id));
    toast.success('Habit deleted');
  }, []);

  const completeHabit = useCallback(async (id, date) => {
    const { data } = await api.post(`/habits/${id}/complete`, { date });
    setHabits(prev => prev.map(h => h._id === id ? data.habit : h));
    if (data.completed) toast.success('✅ Habit completed!');
    return data;
  }, []);

  // Today's date string
  const todayStr = new Date().toISOString().split('T')[0];

  // Derived: habits with completedToday flag
  const habitsWithStatus = habits.map(h => ({
    ...h,
    completedToday: h.completions?.some(c => c.date === todayStr) ?? false,
  }));

  return {
    habits: habitsWithStatus,
    loading,
    error,
    fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    completeHabit,
  };
}
