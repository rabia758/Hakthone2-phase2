import React, { useState, useEffect } from 'react';
import { Task } from '../../types';
import { apiClient } from '../../lib/api';

interface TaskListProps {
  userId: number;
  onTaskUpdated: () => void;
  onTaskDeleted: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ userId, onTaskUpdated, onTaskDeleted }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [userId]);

  const fetchTasks = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null); // Clear previous errors
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

  const toggleTaskCompletion = async (task: Task) => {
    setUpdatingTaskId(task.id);
    try {
      const response = await apiClient.updateTaskCompletion(userId, task.id, !task.completed);
      if (response.success) {
        setTasks(tasks.map(t =>
          t.id === task.id ? { ...t, completed: !t.completed } : t
        ));
        onTaskUpdated();
      }
    } catch (err) {
      setError('Failed to update task completion');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const deleteTask = async (taskId: number) => {
    setDeletingTaskId(taskId);
    try {
      const response = await apiClient.deleteTask(userId, taskId);
      if (response.success) {
        setTasks(tasks.filter(task => task.id !== taskId));
        onTaskDeleted();
      }
    } catch (err) {
      setError('Failed to delete task');
    } finally {
      setDeletingTaskId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-500/20 p-4 border border-red-500/30">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No tasks yet</h3>
          <p className="text-gray-400">Get started by creating your first task.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li key={task.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4 flex-1">
                  <button
                    onClick={() => toggleTaskCompletion(task)}
                    disabled={updatingTaskId === task.id}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      task.completed
                        ? 'bg-gradient-to-r from-green-500 to-teal-500 border-green-500'
                        : 'border-blue-500 hover:border-blue-400'
                    } ${updatingTaskId === task.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {task.completed && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-base font-medium transition-all duration-200 ${
                      task.completed
                        ? 'text-gray-400 line-through'
                        : 'text-white'
                    } ${updatingTaskId === task.id ? 'opacity-50' : ''}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className={`text-sm mt-1 ${
                        task.completed ? 'text-gray-500' : 'text-gray-400'
                      } ${updatingTaskId === task.id ? 'opacity-50' : ''}`}>
                        {task.description}
                      </p>
                    )}
                  </div>
                  {updatingTaskId === task.id && (
                    <div className="flex-shrink-0">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    task.completed
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {task.completed ? 'Completed' : 'Pending'}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    disabled={deletingTaskId === task.id}
                    className={`p-2 rounded-lg ${
                      deletingTaskId === task.id
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-red-400 hover:text-red-300 hover:bg-red-500/20'
                    } transition-colors duration-200`}
                  >
                    {deletingTaskId === task.id ? (
                      <div className="flex items-center">
                        <svg className="animate-spin h-4 w-4 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;