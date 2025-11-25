import { apiClient } from '@/lib/utils/api-client';

describe('API Client', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should make GET requests', async () => {
    const mockData = { success: true, data: { id: 1 } };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await apiClient.request('/test');
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockData.data);
  });

  it('should handle errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const result = await apiClient.request('/test');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should make POST requests', async () => {
    const mockData = { success: true, data: { id: 1 } };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await apiClient.request('/test', {
      method: 'POST',
      body: { test: 'data' },
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
      })
    );
  });
});
