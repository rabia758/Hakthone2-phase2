import { apiClient } from '../src/lib/api';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch
global.fetch = jest.fn();

describe('ApiClient', () => {
  const mockToken = 'test-token';
  const mockUser = { id: 1, email: 'test@example.com' };
  const mockTask = { id: 1, title: 'Test Task', description: 'Test Description', completed: false, user_id: 1 };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Authentication methods', () => {
    test('register - successful registration', async () => {
      const mockResponse = { success: true, data: mockUser };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await apiClient.register({ email: 'test@example.com', password: 'password' });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
        })
      );
    });

    test('login - successful login with token storage', async () => {
      const mockLoginResponse = { success: true, data: { user: mockUser, token: mockToken } };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockLoginResponse),
      });

      const result = await apiClient.login({ email: 'test@example.com', password: 'password' });

      expect(result).toEqual(mockLoginResponse);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', mockToken);
    });

    test('logout - removes token from localStorage', async () => {
      localStorageMock.removeItem.mockClear();
      await apiClient.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('Task management methods', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue(mockToken);
    });

    test('getTasks - successful retrieval', async () => {
      const mockTasksResponse = {
        success: true,
        data: {
          tasks: [mockTask],
          total: 1,
          limit: 50,
          offset: 0
        }
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockTasksResponse),
      });

      const result = await apiClient.getTasks(1);

      expect(result).toEqual(mockTasksResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/1/tasks'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`,
          }),
        })
      );
    });

    test('createTask - successful creation', async () => {
      const newTaskData = { title: 'New Task', description: 'New Description', completed: false };
      const mockCreateResponse = { success: true, data: { ...mockTask, ...newTaskData, id: 2 } };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockCreateResponse),
      });

      const result = await apiClient.createTask(1, newTaskData);

      expect(result).toEqual(mockCreateResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/1/tasks'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newTaskData),
        })
      );
    });

    test('getTask - successful retrieval', async () => {
      const mockGetResponse = { success: true, data: mockTask };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockGetResponse),
      });

      const result = await apiClient.getTask(1, 1);

      expect(result).toEqual(mockGetResponse);
    });

    test('updateTask - successful update', async () => {
      const updateData = { title: 'Updated Task' };
      const mockUpdateResponse = { success: true, data: { ...mockTask, title: 'Updated Task' } };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockUpdateResponse),
      });

      const result = await apiClient.updateTask(1, 1, updateData);

      expect(result).toEqual(mockUpdateResponse);
    });

    test('deleteTask - successful deletion', async () => {
      const mockDeleteResponse = { success: true };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockDeleteResponse),
      });

      const result = await apiClient.deleteTask(1, 1);

      expect(result).toEqual(mockDeleteResponse);
    });

    test('updateTaskCompletion - successful completion update', async () => {
      const mockCompletionResponse = { success: true, data: { ...mockTask, completed: true } };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockCompletionResponse),
      });

      const result = await apiClient.updateTaskCompletion(1, 1, true);

      expect(result).toEqual(mockCompletionResponse);
    });
  });

  describe('Error handling', () => {
    test('handles network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await apiClient.getTasks(1);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('handles HTTP error responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await apiClient.getTasks(1);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Caching', () => {
    test('caches GET requests', async () => {
      const mockTasksResponse = {
        success: true,
        data: {
          tasks: [mockTask],
          total: 1,
          limit: 50,
          offset: 0
        }
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockTasksResponse),
      });

      // First call should make a fetch request
      await apiClient.getTasks(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await apiClient.getTasks(1);
      // Still only one fetch call because of caching
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test('clears cache after POST requests', async () => {
      const mockTasksResponse = {
        success: true,
        data: {
          tasks: [mockTask],
          total: 1,
          limit: 50,
          offset: 0
        }
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue(mockTasksResponse) }) // First getTasks
        .mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue({ success: true, data: mockTask }) }) // createTask
        .mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue(mockTasksResponse) }); // Second getTasks

      // First call should make a fetch request
      await apiClient.getTasks(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Create task (should clear cache)
      await apiClient.createTask(1, { title: 'New Task', description: 'New Description', completed: false });

      // Second getTasks call should make another fetch request since cache was cleared
      await apiClient.getTasks(1);
      expect(global.fetch).toHaveBeenCalledTimes(3); // 1 for first getTasks, 1 for createTask, 1 for second getTasks
    });
  });
});