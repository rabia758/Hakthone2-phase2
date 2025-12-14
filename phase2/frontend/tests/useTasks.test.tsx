import { renderHook, act } from '@testing-library/react';
import { useTasks } from '../src/hooks/useTasks';
import { apiClient } from '../src/lib/api';

// Mock the apiClient
jest.mock('../src/lib/api', () => ({
  apiClient: {
    getTasks: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    updateTaskCompletion: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('useTasks hook', () => {
  const mockUserId = 1;
  const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
    user_id: mockUserId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initial state', () => {
    const { result } = renderHook(() => useTasks());

    expect(result.current.tasks).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('fetchTasks - successful retrieval', async () => {
    const mockTasks = [mockTask];
    mockApiClient.getTasks.mockResolvedValueOnce({
      success: true,
      data: {
        tasks: mockTasks,
        total: 1,
        limit: 50,
        offset: 0
      },
    });

    const { result } = renderHook(() => useTasks());

    await act(async () => {
      await result.current.fetchTasks(mockUserId);
    });

    expect(mockApiClient.getTasks).toHaveBeenCalledWith(mockUserId);
    expect(result.current.tasks).toEqual(mockTasks);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('fetchTasks - error handling', async () => {
    mockApiClient.getTasks.mockResolvedValueOnce({
      success: false,
      error: { message: 'Failed to fetch tasks' },
    });

    const { result } = renderHook(() => useTasks());

    await act(async () => {
      await result.current.fetchTasks(mockUserId);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Failed to fetch tasks');
  });

  test('createTask - successful creation', async () => {
    const newTask = { title: 'New Task', description: 'New Description', completed: false };
    mockApiClient.createTask.mockResolvedValueOnce({
      success: true,
      data: { ...mockTask, id: 2, ...newTask },
    });

    const { result } = renderHook(() => useTasks());

    await act(async () => {
      await result.current.createTask(mockUserId, newTask);
    });

    expect(mockApiClient.createTask).toHaveBeenCalledWith(mockUserId, newTask);
    expect(result.current.tasks).toContainEqual(expect.objectContaining({ title: 'New Task' }));
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('createTask - error handling', async () => {
    const newTask = { title: 'New Task', description: 'New Description', completed: false };
    mockApiClient.createTask.mockResolvedValueOnce({
      success: false,
      error: { message: 'Failed to create task' },
    });

    const { result } = renderHook(() => useTasks());

    await act(async () => {
      await result.current.createTask(mockUserId, newTask);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Failed to create task');
  });

  test('updateTask - successful update', async () => {
    const updateData = { title: 'Updated Task' };
    mockApiClient.updateTask.mockResolvedValueOnce({
      success: true,
      data: { ...mockTask, title: 'Updated Task' },
    });

    const { result } = renderHook(() => useTasks());

    // First, add a task to the state
    act(() => {
      result.current.fetchTasks = jest.fn().mockImplementation(async () => {
        result.current.setTasks([{ ...mockTask }]);
      });
    });

    await act(async () => {
      await result.current.updateTask(mockUserId, mockTask.id, updateData);
    });

    expect(mockApiClient.updateTask).toHaveBeenCalledWith(mockUserId, mockTask.id, updateData);
    expect(result.current.tasks).toContainEqual(expect.objectContaining({ title: 'Updated Task' }));
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('deleteTask - successful deletion', async () => {
    mockApiClient.deleteTask.mockResolvedValueOnce({
      success: true,
    });

    const { result } = renderHook(() => useTasks());

    // First, add a task to the state
    act(() => {
      result.current.setTasks([{ ...mockTask }]);
    });

    await act(async () => {
      await result.current.deleteTask(mockUserId, mockTask.id);
    });

    expect(mockApiClient.deleteTask).toHaveBeenCalledWith(mockUserId, mockTask.id);
    expect(result.current.tasks).not.toContainEqual(expect.objectContaining({ id: mockTask.id }));
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('toggleTaskCompletion - successful update', async () => {
    mockApiClient.updateTaskCompletion.mockResolvedValueOnce({
      success: true,
      data: { ...mockTask, completed: true },
    });

    const { result } = renderHook(() => useTasks());

    // First, add a task to the state
    act(() => {
      result.current.setTasks([{ ...mockTask }]);
    });

    await act(async () => {
      await result.current.toggleTaskCompletion(mockUserId, mockTask.id, true);
    });

    expect(mockApiClient.updateTaskCompletion).toHaveBeenCalledWith(mockUserId, mockTask.id, true);
    expect(result.current.tasks).toContainEqual(expect.objectContaining({ completed: true }));
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});