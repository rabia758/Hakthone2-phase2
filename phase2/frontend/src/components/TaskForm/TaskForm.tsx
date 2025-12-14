import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiClient } from '../../lib/api';

interface TaskFormProps {
  onTaskCreated: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!user) {
      setError('You must be logged in to create a task');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await apiClient.createTask(user.id, {
        title: title.trim(),
        description: description.trim() || null,
        completed: false,
      });

      if (response.success) {
        setTitle('');
        setDescription('');
        onTaskCreated();
      } else {
        setError(response.error?.message || 'Failed to create task');
      }
    } catch (err) {
      setError('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-500/20 p-4 border border-red-500/30">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
            Task Title *
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-all duration-200 py-3 px-4"
            placeholder="What needs to be done?"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-all duration-200 py-3 px-4"
            placeholder="Add details (optional)"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all duration-200 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isSubmitting ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <span className="flex items-center">
                <span>Add Task</span>
                <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;