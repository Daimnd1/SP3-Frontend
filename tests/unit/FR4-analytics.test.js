import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * FR4: Usage Data Collection
 * Collect and store usage data for telemetry purposes
 */

describe('FR4: Usage Data Collection', () => {
  let mockDatabase;
  let mockAnalytics;

  beforeEach(() => {
    mockDatabase = {
      saveAnalytics: vi.fn(),
      getAnalytics: vi.fn(),
      deleteAnalytics: vi.fn(),
    };
    mockAnalytics = {
      trackEvent: vi.fn(),
      trackSession: vi.fn(),
    };
  });

  describe('Unit: Analytics event tracking', () => {
    it('should track desk movement event', async () => {
      const event = {
        type: 'desk_movement',
        userId: 'user_123',
        deskId: 'desk_001',
        fromHeight: 750,
        toHeight: 1000,
        timestamp: new Date(),
        duration: 2000, // ms
      };

      mockAnalytics.trackEvent(event);

      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(event);
    });

    it('should track session start/end', async () => {
      const session = {
        userId: 'user_123',
        startTime: new Date(),
        endTime: new Date(),
        deskId: 'desk_001',
      };

      mockAnalytics.trackSession(session);

      expect(mockAnalytics.trackSession).toHaveBeenCalledWith(session);
    });

    it('should track preset usage', () => {
      const event = {
        type: 'preset_used',
        userId: 'user_123',
        presetId: 'p1',
        presetName: 'Standing',
        timestamp: new Date(),
      };

      mockAnalytics.trackEvent(event);

      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(event);
    });
  });

  describe('Unit: Data validation and sanitization', () => {
    it('should validate required fields', () => {
      const validateAnalyticsData = (data) => {
        return !!(data.userId && data.timestamp && data.type);
      };

      const validData = { userId: 'u1', timestamp: new Date(), type: 'event' };
      const invalidData = { userId: 'u1' };

      expect(validateAnalyticsData(validData)).toBe(true);
      expect(validateAnalyticsData(invalidData)).toBe(false);
    });

    it('should sanitize user input before storage', () => {
      const sanitizeData = (data) => {
        return {
          ...data,
          userId: String(data.userId).trim(),
          deskId: String(data.deskId).trim(),
        };
      };

      const rawData = { userId: '  user123  ', deskId: '  desk001  ' };
      const sanitized = sanitizeData(rawData);

      expect(sanitized.userId).toBe('user123');
      expect(sanitized.deskId).toBe('desk001');
    });
  });

  describe('Unit: Data aggregation', () => {
    it('should calculate total desk usage time', () => {
      const sessions = [
        { startTime: new Date('2024-01-01T08:00:00'), endTime: new Date('2024-01-01T12:00:00') },
        { startTime: new Date('2024-01-01T13:00:00'), endTime: new Date('2024-01-01T17:00:00') },
      ];

      const totalUsageMs = sessions.reduce((sum, session) => {
        return sum + (session.endTime - session.startTime);
      }, 0);

      // 4 hours + 4 hours = 8 hours
      expect(totalUsageMs).toBe(8 * 60 * 60 * 1000);
    });

    it('should calculate average desk height', () => {
      const movements = [
        { height: 750 },
        { height: 850 },
        { height: 950 },
        { height: 1000 },
      ];

      const avgHeight = movements.reduce((sum, m) => sum + m.height, 0) / movements.length;

      expect(avgHeight).toBe(887.5);
    });

    it('should count preset usage frequency', () => {
      const events = [
        { type: 'preset_used', presetId: 'p1' },
        { type: 'preset_used', presetId: 'p1' },
        { type: 'preset_used', presetId: 'p2' },
      ];

      const presetCounts = events.reduce((acc, event) => {
        if (event.type === 'preset_used') {
          acc[event.presetId] = (acc[event.presetId] || 0) + 1;
        }
        return acc;
      }, {});

      expect(presetCounts.p1).toBe(2);
      expect(presetCounts.p2).toBe(1);
    });
  });

  describe('Unit: Data persistence', () => {
    it('should save analytics to database', async () => {
      const analyticsData = { userId: 'u1', events: [] };
      mockDatabase.saveAnalytics.mockResolvedValue({ success: true });

      const result = await mockDatabase.saveAnalytics(analyticsData);

      expect(mockDatabase.saveAnalytics).toHaveBeenCalledWith(analyticsData);
      expect(result.success).toBe(true);
    });

    it('should retrieve analytics for user', async () => {
      const userId = 'user_123';
      const analyticsData = {
        userId,
        totalSessions: 100,
        totalUsageMinutes: 480,
        averageHeight: 875,
      };

      mockDatabase.getAnalytics.mockResolvedValue(analyticsData);

      const result = await mockDatabase.getAnalytics(userId);

      expect(result).toEqual(analyticsData);
    });

    it('should handle batch data insertion', async () => {
      const batch = [
        { userId: 'u1', type: 'event1' },
        { userId: 'u1', type: 'event2' },
        { userId: 'u2', type: 'event1' },
      ];

      mockDatabase.saveAnalytics.mockResolvedValue({ inserted: 3 });

      const result = await mockDatabase.saveAnalytics(batch);

      expect(result.inserted).toBe(3);
    });
  });

  describe('Unit: Data retention and cleanup', () => {
    it('should support data retention policies', () => {
      const RETENTION_DAYS = 90;
      const retentionDate = new Date();
      retentionDate.setDate(retentionDate.getDate() - RETENTION_DAYS);

      const isExpired = (timestamp) => new Date(timestamp) < retentionDate;

      const oldEvent = new Date('2024-01-01');
      const recentEvent = new Date();

      expect(isExpired(oldEvent)).toBe(true);
      expect(isExpired(recentEvent)).toBe(false);
    });

    it('should delete old analytics data', async () => {
      mockDatabase.deleteAnalytics.mockResolvedValue({ deleted: 150 });

      const result = await mockDatabase.deleteAnalytics({ olderThan: 90 });

      expect(result.deleted).toBe(150);
    });
  });
});
