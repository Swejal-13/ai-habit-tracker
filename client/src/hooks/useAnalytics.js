import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export function useAnalytics() {
  const [dashboard, setDashboard] = useState(null);
  const [habitStats, setHabitStats] = useState([]);
  const [focusStats, setFocusStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, habits, focus] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/analytics/habits'),
        api.get('/analytics/focus/stats'),
      ]);
      setDashboard(dash.data.dashboard);
      setHabitStats(habits.data.analytics);
      setFocusStats(focus.data.stats);
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const logFocusSession = useCallback(async (payload) => {
    const { data } = await api.post('/analytics/focus', payload);
    return data.session;
  }, []);

  return { dashboard, habitStats, focusStats, loading, refresh: fetchAll, logFocusSession };
}
