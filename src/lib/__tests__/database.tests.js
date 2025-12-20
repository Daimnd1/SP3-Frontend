import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as database from '../database';

const mockSupabase = {
  from: vi.fn(),
  auth: { getUser: vi.fn() }
};

vi.mock('../supabase', () => ({
  supabase: mockSupabase
}));

describe('database', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('upsertDeskByMacAddress', () => {
    it('should create new desk record with MAC address', async () => {
      mockSupabase.from.mockReturnValue({
        upsert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { id: 1, mac_address: 'aa:bb:cc:dd:ee:ff', name: 'Test Desk' },
              error: null
            }))
          }))
        }))
      });

      const result = await database.upsertDeskByMacAddress('aa:bb:cc:dd:ee:ff', 'Test Desk');
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.mac_address).toBe('aa:bb:cc:dd:ee:ff');
    });

    it('should update existing desk with same MAC address', async () => {
      mockSupabase.from.mockReturnValue({
        upsert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { id: 1, mac_address: 'aa:bb:cc:dd:ee:ff', name: 'Updated Desk' },
              error: null
            }))
          }))
        }))
      });

      const result = await database.upsertDeskByMacAddress('aa:bb:cc:dd:ee:ff', 'Updated Desk');
      expect(result.name).toBe('Updated Desk');
    });

    it('should handle database error', async () => {
      mockSupabase.from.mockReturnValue({
        upsert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Database constraint violation' }
            }))
          }))
        }))
      });

      await expect(database.upsertDeskByMacAddress('invalid', 'Test')).rejects.toThrow();
    });
  });

  describe('setDeskInUse', () => {
    it('should mark desk as in use by user', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      });

      await expect(database.setDeskInUse(1, 'user-123')).resolves.not.toThrow();
    });

    it('should handle non-existent desk error', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            data: null,
            error: { message: 'Desk not found' }
          }))
        }))
      });

      await expect(database.setDeskInUse(999, 'user-123')).rejects.toThrow();
    });
  });

  describe('setDeskNotInUse', () => {
    it('should mark desk as available', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      });

      await expect(database.setDeskNotInUse(1)).resolves.not.toThrow();
    });

    it('should clear user assignment from desk', async () => {
      const mockUpdate = vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
      }));
      mockSupabase.from.mockReturnValue({ update: mockUpdate });

      await database.setDeskNotInUse(1);
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe('addUserDesk', () => {
    it('should create user-desk relationship with heights', async () => {
      mockSupabase.from.mockReturnValue({
        upsert: vi.fn(() => Promise.resolve({ data: null, error: null }))
      });

      await expect(database.addUserDesk('user-123', 1, 750, 1100)).resolves.not.toThrow();
    });

    it('should handle duplicate user-desk entry', async () => {
      mockSupabase.from.mockReturnValue({
        upsert: vi.fn(() => Promise.resolve({ data: null, error: null }))
      });

      await expect(database.addUserDesk('user-123', 1, 750, 1100)).resolves.not.toThrow();
    });
  });

  describe('updateDeskHeight', () => {
    it('should update current desk height', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      });

      await expect(database.updateDeskHeight(1, 950)).resolves.not.toThrow();
    });

    it('should handle invalid height error', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            data: null,
            error: { message: 'Invalid height value' }
          }))
        }))
      });

      await expect(database.updateDeskHeight(1, -100)).rejects.toThrow();
    });
  });

  describe('getUserDesks', () => {
    it('should fetch all desks for a user', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            data: [{ id: 1, user_id: 'user-123', desk_id: 1 }],
            error: null
          }))
        }))
      });

      const result = await database.getUserDesks('user-123');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty array for new user', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      });

      const result = await database.getUserDesks('new-user');
      expect(result).toEqual([]);
    });
  });
});