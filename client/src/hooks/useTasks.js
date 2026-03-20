import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export function useTasks(type = null) {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = type ? { type } : {};
      const { data } = await api.get('/tasks', { params });
      setTasks(data.tasks);
    } catch (err) {
      console.error('Tasks fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const createTask = useCallback(async (payload) => {
    const { data } = await api.post('/tasks', payload);
    setTasks(prev => [data.task, ...prev]);
    toast.success('Task added!');
    return data.task;
  }, []);

  const updateTask = useCallback(async (id, payload) => {
    const { data } = await api.put(`/tasks/${id}`, payload);
    setTasks(prev => prev.map(t => t._id === id ? data.task : t));
    return data.task;
  }, []);

  const deleteTask = useCallback(async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks(prev => prev.filter(t => t._id !== id));
    toast.success('Task deleted');
  }, []);

  const toggleTask = useCallback(async (id) => {
    const { data } = await api.patch(`/tasks/${id}/toggle`);
    setTasks(prev => prev.map(t => t._id === id ? data.task : t));
    return data.task;
  }, []);

  const pending   = tasks.filter(t => !t.isCompleted);
  const completed = tasks.filter(t => t.isCompleted);
  const pct       = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0;

  return { tasks, pending, completed, pct, loading, fetchTasks, createTask, updateTask, deleteTask, toggleTask };
}
