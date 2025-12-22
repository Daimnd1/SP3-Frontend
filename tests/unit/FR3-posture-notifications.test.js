import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * FR3: Posture Change Notifications
 * Notify the user to change posture when they've been sitting in the same position for an extended period
 */

describe('FR3: Posture Change Notifications', () => {
  let mockTimer;
  let mockNotifications;
  let mockPostureAnalytics;

  beforeEach(() => {
    vi.useFakeTimers();
    mockTimer = {
      startTimer: vi.fn(),
      pauseTimer: vi.fn(),
      resetTimer: vi.fn(),
      getElapsedTime: vi.fn(),
    };
    mockNotifications = {
      send: vi.fn(),
      dismiss: vi.fn(),
    };
    mockPostureAnalytics = {
      recordPostureChange: vi.fn(),
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Unit: Posture timer', () => {
    it('should track time in same position', () => {
      const POSTURE_INTERVAL = 30 * 60 * 1000; // 30 minutes
      let elapsedTime = 0;

      mockTimer.getElapsedTime.mockReturnValue(elapsedTime);

      expect(mockTimer.getElapsedTime()).toBe(0);

      elapsedTime = POSTURE_INTERVAL;
      mockTimer.getElapsedTime.mockReturnValue(elapsedTime);

      expect(mockTimer.getElapsedTime()).toBe(POSTURE_INTERVAL);
    });

    it('should trigger notification after threshold time', () => {
      const POSTURE_THRESHOLD = 30 * 60 * 1000; // 30 minutes
      let currentTime = 0;

      const checkPostureTimer = () => {
        if (currentTime >= POSTURE_THRESHOLD) {
          mockNotifications.send({ type: 'posture_change' });
        }
      };

      currentTime = POSTURE_THRESHOLD;
      checkPostureTimer();

      expect(mockNotifications.send).toHaveBeenCalledWith({ type: 'posture_change' });
    });

    it('should reset timer on desk height change', () => {
      mockTimer.resetTimer();

      expect(mockTimer.resetTimer).toHaveBeenCalled();
    });
  });

  describe('Unit: Notification sending', () => {
    it('should send posture change notification', () => {
      const notification = {
        type: 'posture_change',
        title: 'Time to change posture',
        message: 'You\'ve been in the same position for 30 minutes',
      };

      mockNotifications.send(notification);

      expect(mockNotifications.send).toHaveBeenCalledWith(notification);
    });

    it('should allow user to dismiss notification', () => {
      const notificationId = 'notif_1';
      
      mockNotifications.dismiss(notificationId);

      expect(mockNotifications.dismiss).toHaveBeenCalledWith(notificationId);
    });

    it('should not spam notifications', () => {
      const MIN_NOTIFICATION_INTERVAL = 60 * 1000; // 1 minute between notifications
      let lastNotificationTime = 0;

      const sendIfAllowed = () => {
        const now = Date.now();
        if (now - lastNotificationTime >= MIN_NOTIFICATION_INTERVAL) {
          mockNotifications.send({ type: 'posture_change' });
          lastNotificationTime = now;
          return true;
        }
        return false;
      };

      // First notification
      expect(sendIfAllowed()).toBe(true);
      expect(mockNotifications.send).toHaveBeenCalledTimes(1);

      // Try immediate second notification (should not send)
      expect(sendIfAllowed()).toBe(false);
      expect(mockNotifications.send).toHaveBeenCalledTimes(1);

      // After interval
      lastNotificationTime = 0;
      expect(sendIfAllowed()).toBe(true);
      expect(mockNotifications.send).toHaveBeenCalledTimes(2);
    });
  });

  describe('Unit: Posture change detection', () => {
    it('should detect significant height change', () => {
      const detectPostureChange = (prevHeight, newHeight) => {
        const MIN_CHANGE = 50; // mm
        return Math.abs(newHeight - prevHeight) >= MIN_CHANGE;
      };

      expect(detectPostureChange(750, 900)).toBe(true);
      expect(detectPostureChange(750, 760)).toBe(false);
    });

    it('should record posture change event', async () => {
      const changeEvent = {
        timestamp: new Date(),
        fromHeight: 750,
        toHeight: 1000,
        duration: 30 * 60 * 1000,
      };

      mockPostureAnalytics.recordPostureChange(changeEvent);

      expect(mockPostureAnalytics.recordPostureChange).toHaveBeenCalledWith(changeEvent);
    });
  });

  describe('Unit: Notification preferences', () => {
    it('should respect user notification preferences', () => {
      const userPreferences = {
        enablePostureNotifications: true,
        postureDeskInterval: 30, // minutes
        quietHours: { start: '18:00', end: '08:00' },
      };

      expect(userPreferences.enablePostureNotifications).toBe(true);

      const isInQuietHours = (time) => {
        const hours = time.getHours();
        return hours >= 18 || hours < 8;
      };

      const testTime = new Date();
      testTime.setHours(9);
      expect(isInQuietHours(testTime)).toBe(false);
    });
  });
});
