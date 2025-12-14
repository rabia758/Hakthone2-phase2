import { useState, useEffect } from 'react';
import { Task } from '../types';
import { apiClient } from '../lib/api';

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: (userId: number) => Promise<void>;
  createTask: (userId: number, taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  updateTask: (userId: number, taskId: number, taskData: Partial<Task>) => Promise<void>;
  deleteTask: (userId: number, taskId: number) => Promise<void>;
  toggleTaskCompletion: (userId: number, taskId: number, completed: boolean) => Promise<void>;
}

export const useTasks = (): UseTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async (userId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getTasks(userId);
      if (response.success && response.data) {
        setTasks(response.data.tasks);
      } else {
        setError(response.error?.message || 'Failed to fetch tasks');
      }
    } catch (err) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (
    userId: number,
    taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.createTask(userId, taskData);
      if (response.success && response.data) {
        setTasks(prev => [...prev, response.data]);
      } else {
        setError(response.error?.message || 'Failed to create task');
      }
    } catch (err) {
      setError('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (userId: number, taskId: number, taskData: Partial<Task>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.updateTask(userId, taskId, taskData);
      if (response.success && response.data) {
        setTasks(prev => prev.map(task => task.id === taskId ? response.data! : task));
      } else {
        setError(response.error?.message || 'Failed to update task');
      }
    } catch (err) {
      setError('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (userId: number, taskId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.deleteTask(userId, taskId);
      if (response.success) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
      } else {
        setError(response.error?.message || 'Failed to delete task');
      }
    } catch (err) {
      setError('Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (userId: number, taskId: number, completed: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.updateTaskCompletion(userId, taskId, completed);
      if (response.success && response.data) {
        setTasks(prev => prev.map(task =>
          task.id === taskId ? response.data! : task
        ));
      } else {
        setError(response.error?.message || 'Failed to update task completion');
      }
    } catch (err) {
      setError('Failed to update task completion');
    } finally {
      setLoading(false);
    }
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
  };
};