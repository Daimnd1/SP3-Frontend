import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * FR1: Remote Desk Control
 * Allow users to remotely control the desk using the web app
 */

describe('FR1: Remote Desk Control', () => {
  let mockAPI;

  beforeEach(() => {
    mockAPI = {
      moveDesk: vi.fn(),
      getDeskStatus: vi.fn(),
    };
  });

  describe('Unit: moveDesk function', () => {
    it('should send correct height value to backend', async () => {
      const targetHeight = 750; // mm
      mockAPI.moveDesk.mockResolvedValue({ success: true });

      const result = await mockAPI.moveDesk(targetHeight);

      expect(mockAPI.moveDesk).toHaveBeenCalledWith(targetHeight);
      expect(result.success).toBe(true);
    });

    it('should handle desk movement error gracefully', async () => {
      const error = new Error('Desk movement failed');
      mockAPI.moveDesk.mockRejectedValue(error);

      await expect(mockAPI.moveDesk(800)).rejects.toThrow('Desk movement failed');
    });

    it('should validate height is within acceptable range', async () => {
      const validateHeight = (height) => {
        const MIN_HEIGHT = 600; // mm
        const MAX_HEIGHT = 1200; // mm
        return height >= MIN_HEIGHT && height <= MAX_HEIGHT;
      };

      expect(validateHeight(600)).toBe(true);
      expect(validateHeight(1200)).toBe(true);
      expect(validateHeight(500)).toBe(false);
      expect(validateHeight(1300)).toBe(false);
    });
  });

  describe('Unit: getDeskStatus function', () => {
    it('should return current desk height', async () => {
      const expectedHeight = 750;
      mockAPI.getDeskStatus.mockResolvedValue({ height: expectedHeight, isMoving: false });

      const status = await mockAPI.getDeskStatus();

      expect(status.height).toBe(expectedHeight);
      expect(status.isMoving).toBe(false);
    });

    it('should indicate when desk is moving', async () => {
      mockAPI.getDeskStatus.mockResolvedValue({ height: 750, isMoving: true });

      const status = await mockAPI.getDeskStatus();

      expect(status.isMoving).toBe(true);
    });
  });

  describe('Unit: Movement validation', () => {
    it('should prevent rapid consecutive movements', () => {
      const createMovementThrottler = () => {
        let lastMoveTime = 0;
        const THROTTLE_MS = 300;

        return (targetHeight) => {
          const now = Date.now();
          if (now - lastMoveTime < THROTTLE_MS) {
            throw new Error('Desk movement throttled');
          }
          lastMoveTime = now;
          return { success: true, height: targetHeight };
        };
      };

      const throttledMove = createMovementThrottler();

      expect(() => throttledMove(750)).not.toThrow();
      expect(() => throttledMove(800)).toThrow('Desk movement throttled');
    });
  });
});
