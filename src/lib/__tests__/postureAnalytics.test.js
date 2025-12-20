import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateDailyStats,
  getWeeklyStats,
  formatDuration,
  msToHours,
  getPostureChangeFrequency,
  getSessionDurationDistribution,
  calculatePostureBalance
} from '../postureAnalytics';
import * as postureData from '../postureData';

// Mock the postureData module
vi.mock('../postureData');

describe('postureAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('msToHours', () => {
    it('should convert milliseconds to hours', () => {
      expect(msToHours(3600000)).toBe('1.0');
      expect(msToHours(1800000)).toBe('0.5');
    });

    it('should handle zero milliseconds', () => {
      const result = msToHours(0);
      expect(result).toBe('0.0');
    });

    it('should convert 8-hour workday correctly', () => {
      const result = msToHours(28800000);
      expect(result).toBe('8.0');
    });

    it('should return a string type', () => {
      const result = msToHours(3600000);
      expect(typeof result).toBe('string');
    });

    it('should handle negative milliseconds', () => {
      const result = msToHours(-3600000);
      expect(result).toBe('-1.0');
    });

    it('should round to 1 decimal place', () => {
      const result = msToHours(3666666); // ~1.018 hours
      expect(result).toMatch(/^\d+\.\d$/);
    });
  });

  describe('calculatePostureBalance', () => {
    it('should calculate percentages', () => {
      const result = calculatePostureBalance(3600000, 1800000);

      expect(result.sitting).toBe(67);
      expect(result.standing).toBe(33);
    });

    it('should handle zero total (avoid division by zero)', () => {
      const result = calculatePostureBalance(0, 0);

      expect(result.sitting).toBe(0);
      expect(result.standing).toBe(0);
    });

    it('should handle 100% sitting', () => {
      const result = calculatePostureBalance(3600000, 0);

      expect(result.sitting).toBe(100);
      expect(result.standing).toBe(0);
    });
  });

  describe('calculateDailyStats', () => {
    it('should calculate stats with sitting and standing sessions', async () => {
      const mockSessions = [
        { mode: 'sitting', duration_ms: 1800000 }, // 30 min
        { mode: 'sitting', duration_ms: 3600000 }, // 60 min
        { mode: 'standing', duration_ms: 900000 }  // 15 min
      ];
      const mockChanges = [{}, {}]; // 2 changes

      postureData.getPostureSessions = vi.fn().mockResolvedValue(mockSessions);
      postureData.getPostureChanges = vi.fn().mockResolvedValue(mockChanges);

      const result = await calculateDailyStats('user-123', new Date('2024-01-15'));

      expect(result.total_sitting_ms).toBe(5400000);
      expect(result.total_standing_ms).toBe(900000);
      expect(result.posture_changes_count).toBe(2);
      expect(result.avg_sitting_session_ms).toBe(2700000);
      expect(result.avg_standing_session_ms).toBe(900000);
      expect(result.total_sessions).toBe(3);
    });

    it('should handle no sessions (avoid division by zero)', async () => {
      postureData.getPostureSessions = vi.fn().mockResolvedValue([]);
      postureData.getPostureChanges = vi.fn().mockResolvedValue([]);

      const result = await calculateDailyStats('user-123', new Date('2024-01-15'));

      expect(result.avg_sitting_session_ms).toBe(0);
      expect(result.avg_standing_session_ms).toBe(0);
      expect(result.total_sessions).toBe(0);
    });

    it('should handle sessions without duration_ms', async () => {
      const mockSessions = [
        { mode: 'sitting' }, // No duration_ms
      ];

      postureData.getPostureSessions = vi.fn().mockResolvedValue(mockSessions);
      postureData.getPostureChanges = vi.fn().mockResolvedValue([]);

      const result = await calculateDailyStats('user-123', new Date('2024-01-15'));

      expect(result.total_sitting_ms).toBe(0);
    });
  });

  describe('getWeeklyStats', () => {
    it('should get stats for 7 days', async () => {
      postureData.getPostureSessions = vi.fn().mockResolvedValue([]);
      postureData.getPostureChanges = vi.fn().mockResolvedValue([]);

      const result = await getWeeklyStats('user-123', 7);

      expect(result).toHaveLength(7);
      expect(postureData.getPostureSessions).toHaveBeenCalledTimes(7);
    });

    it('should get stats for custom number of days', async () => {
      postureData.getPostureSessions = vi.fn().mockResolvedValue([]);
      postureData.getPostureChanges = vi.fn().mockResolvedValue([]);

      const result = await getWeeklyStats('user-123', 3);

      expect(result).toHaveLength(3);
    });
  });

  describe('formatDuration', () => {
    it('should format hours and minutes', () => {
      expect(formatDuration(3661000)).toBe('1h 1m'); // 1h 1m 1s
    });

    it('should format zero duration', () => {
      expect(formatDuration(0)).toBe('0h 0m');
    });

    it('should format only minutes', () => {
      expect(formatDuration(900000)).toBe('0h 15m');
    });
  });

  describe('getPostureChangeFrequency', () => {
    it('should group changes by day', async () => {
      const mockChanges = [
        { changed_at: '2024-01-15T10:00:00Z' },
        { changed_at: '2024-01-15T14:00:00Z' },
        { changed_at: '2024-01-16T09:00:00Z' }
      ];

      postureData.getPostureChanges = vi.fn().mockResolvedValue(mockChanges);

      const result = await getPostureChangeFrequency('user-123', 7);

      const keys = Object.keys(result);
      expect(keys.length).toBeGreaterThan(0);
    });

    it('should handle no changes', async () => {
      postureData.getPostureChanges = vi.fn().mockResolvedValue([]);

      const result = await getPostureChangeFrequency('user-123', 7);

      expect(Object.keys(result)).toHaveLength(0);
    });
  });

  describe('getSessionDurationDistribution', () => {
    it('should categorize all duration ranges', async () => {
      const mockSessions = [
        { duration_ms: 600000 },   // 10 min -> short
        { duration_ms: 1200000 },  // 20 min -> medium
        { duration_ms: 2400000 },  // 40 min -> long
        { duration_ms: 4800000 }   // 80 min -> veryLong
      ];

      postureData.getPostureSessions = vi.fn().mockResolvedValue(mockSessions);

      const result = await getSessionDurationDistribution('user-123', 7);

      expect(result.short).toBe(1);
      expect(result.medium).toBe(1);
      expect(result.long).toBe(1);
      expect(result.veryLong).toBe(1);
    });

    it('should handle sessions without duration_ms', async () => {
      const mockSessions = [{ duration_ms: null }];

      postureData.getPostureSessions = vi.fn().mockResolvedValue(mockSessions);

      const result = await getSessionDurationDistribution('user-123', 7);

      expect(result.short).toBe(1); // 0 minutes = short
    });
  });
});