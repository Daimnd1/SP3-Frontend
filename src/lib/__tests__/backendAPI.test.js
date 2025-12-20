import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAllDesks, getDeskData, updateDeskPosition, getDeskCategory } from '../backendAPI';

describe('backendAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAllDesks', () => {
    it('should fetch all desk IDs successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ['desk1', 'desk2', 'desk3']
      });

      const desks = await getAllDesks();
      expect(desks).toEqual(['desk1', 'desk2', 'desk3']);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/desks'),
        expect.any(Object)
      );
    });

    it('should return empty array when no desks available', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      const desks = await getAllDesks();
      expect(desks).toEqual([]);
    });

    it('should handle 404 error with error message', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Desks not found' })
      });

      await expect(getAllDesks()).rejects.toThrow('Desks not found');
    });

    it('should handle 500 server error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Server error' })
      });

      await expect(getAllDesks()).rejects.toThrow('Server error');
    });

    it('should handle network timeout', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network timeout'));
      await expect(getAllDesks()).rejects.toThrow('Network timeout');
    });
  });

  describe('getDeskData', () => {
    const mockDeskData = {
      config: { name: 'Desk 1', id: 'desk1' },
      state: { position_mm: 800, speed: 0 },
      usage: { in_use: false },
      lastErrors: []
    };

    it('should fetch complete desk data by ID', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDeskData
      });

      const data = await getDeskData('desk1');
      expect(data).toEqual(mockDeskData);
      expect(data).toHaveProperty('config');
      expect(data).toHaveProperty('state');
      expect(data).toHaveProperty('usage');
    });

    it('should include desk ID in request URL', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDeskData
      });

      await getDeskData('test-desk-123');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('test-desk-123'),
        expect.any(Object)
      );
    });

    it('should handle desk not found (404)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Desk not found' })
      });

      await expect(getDeskData('invalid-desk')).rejects.toThrow('Desk not found');
    });

    it('should handle desk offline (503)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: async () => ({ error: 'Desk offline' })
      });

      await expect(getDeskData('desk1')).rejects.toThrow('Desk offline');
    });
  });

  describe('getDeskCategory', () => {
    it('should fetch state category successfully', async () => {
      const mockState = { position_mm: 900, speed: 10 };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockState
      });

      const data = await getDeskCategory('desk1', 'state');
      expect(data).toEqual(mockState);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/state'),
        expect.any(Object)
      );
    });

    it('should fetch config category successfully', async () => {
      const mockConfig = { name: 'Desk 1', mac: 'aa:bb:cc' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig
      });

      const data = await getDeskCategory('desk1', 'config');
      expect(data).toEqual(mockConfig);
    });

    it('should handle invalid category error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Invalid category' })
      });

      await expect(getDeskCategory('desk1', 'invalid')).rejects.toThrow('Invalid category');
    });
  });

  describe('updateDeskPosition', () => {
    it('should send position update successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, position: 1000 })
      });

      const result = await updateDeskPosition('desk1', 1000);
      expect(result.success).toBe(true);
      expect(result.position).toBe(1000);
    });

    it('should use PUT method for updates', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await updateDeskPosition('desk1', 1000);
      expect(fetch.mock.calls[0][1].method).toBe('PUT');
    });

    it('should send position in request body', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await updateDeskPosition('desk1', 1000);
      const body = JSON.parse(fetch.mock.calls[0][1].body);
      expect(body.position_mm).toBe(1000);
    });

    it('should handle minimum valid height (680mm)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await updateDeskPosition('desk1', 680);
      const body = JSON.parse(fetch.mock.calls[0][1].body);
      expect(body.position_mm).toBe(680);
    });

    it('should handle maximum valid height (1320mm)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await updateDeskPosition('desk1', 1320);
      const body = JSON.parse(fetch.mock.calls[0][1].body);
      expect(body.position_mm).toBe(1320);
    });

    it('should handle height out of range error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Height out of range (680-1320mm)' })
      });

      await expect(updateDeskPosition('desk1', 500)).rejects.toThrow('Height out of range');
    });

    it('should handle desk not responding error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: async () => ({ error: 'Desk not responding' })
      });

      await expect(updateDeskPosition('desk1', 1000)).rejects.toThrow('Desk not responding');
    });
  });
});