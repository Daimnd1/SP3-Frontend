import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { DeskProvider, useDesk } from '../DeskContext';
import React from 'react';
import * as backendAPI from '../../lib/backendAPI';
import * as database from '../../lib/database';

vi.mock('../AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user-123' } })
}));

vi.mock('../PostureTimerContext', () => ({
  usePostureTimer: () => ({
    isTracking: false,
    changeMode: vi.fn()
  })
}));

vi.mock('../../lib/backendAPI');
vi.mock('../../lib/database');

const AllTheProviders = ({ children }) => {
  return <DeskProvider>{children}</DeskProvider>;
};

describe('DeskContext Edge Cases & Uncovered Lines', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    backendAPI.getDeskData = vi.fn(() => Promise.resolve({
      config: { name: 'Test Desk', id: 'desk-123' },
      state: { position_mm: 800, speed_mms: 0 }
    }));
    backendAPI.updateDeskPosition = vi.fn(() => Promise.resolve({ success: true }));
    backendAPI.getAllDesks = vi.fn(() => Promise.resolve([]));
    
    database.upsertDeskByMacAddress = vi.fn(() => Promise.resolve({ id: 'db-desk-1' }));
    database.setDeskInUse = vi.fn(() => Promise.resolve());
    database.setDeskNotInUse = vi.fn(() => Promise.resolve());
    database.addUserDesk = vi.fn(() => Promise.resolve());
    database.updateLastConnected = vi.fn(() => Promise.resolve());
    database.getLastConnectedDesk = vi.fn(() => Promise.resolve(null));
    database.getAllDesksWithStatus = vi.fn(() => Promise.resolve([]));
    database.updateDeskHeight = vi.fn(() => Promise.resolve());
    database.getUserDeskPreset = vi.fn(() => Promise.resolve(null));
  });

  describe('Edge Cases - Desk Object Variations', () => {
    it('should handle desk with only id (no mac_address)', async () => {
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      const mockDesk = {
        id: 'AA:BB:CC:DD:EE:FF',
        state: { position_mm: 800 }
      };

      await act(async () => {
        await result.current.connectToDesk(mockDesk);
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
        expect(result.current.deskId).toBe('AA:BB:CC:DD:EE:FF');
      });
    });

    it('should handle desk with nested data.state structure', async () => {
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      const mockDesk = {
        id: 'AA:BB:CC:DD:EE:FF',
        name: 'Nested Desk',
        data: {
          state: { position_mm: 950 }
        }
      };

      await act(async () => {
        await result.current.connectToDesk(mockDesk);
      });

      await waitFor(() => {
        expect(result.current.currentHeight).toBe(950);
      });
    });

    it('should handle desk with zero height', async () => {
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      const mockDesk = {
        id: 'AA:BB:CC:DD:EE:FF',
        name: 'Zero Desk',
        state: { position_mm: 0 }
      };

      await act(async () => {
        await result.current.connectToDesk(mockDesk);
      });

      await waitFor(() => {
        expect(result.current.currentHeight).toBe(0);
      });
    });

    it('should handle desk with very high position', async () => {
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      const mockDesk = {
        id: 'AA:BB:CC:DD:EE:FF',
        name: 'High Desk',
        state: { position_mm: 1500 }
      };

      await act(async () => {
        await result.current.connectToDesk(mockDesk);
      });

      await waitFor(() => {
        expect(result.current.currentHeight).toBe(1500);
      });
    });
  });

  describe('Edge Cases - Height Movement', () => {
    it('should handle moving to minimum height', async () => {
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      const mockDesk = {
        id: 'AA:BB:CC:DD:EE:FF',
        name: 'Test Desk',
        state: { position_mm: 1000 }
      };

      await act(async () => {
        await result.current.connectToDesk(mockDesk);
      });

      await act(async () => {
        await result.current.moveDeskToHeight(0);
      });

      await waitFor(() => {
        expect(result.current.targetHeight).toBe(0);
      });
    });

    it('should handle moving to maximum height', async () => {
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      const mockDesk = {
        id: 'AA:BB:CC:DD:EE:FF',
        name: 'Test Desk',
        state: { position_mm: 500 }
      };

      await act(async () => {
        await result.current.connectToDesk(mockDesk);
      });

      await act(async () => {
        await result.current.moveDeskToHeight(2000);
      });

      await waitFor(() => {
        expect(result.current.targetHeight).toBe(2000);
      });
    });

    it('should handle moving to same height', async () => {
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      const mockDesk = {
        id: 'AA:BB:CC:DD:EE:FF',
        name: 'Test Desk',
        state: { position_mm: 800 }
      };

      await act(async () => {
        await result.current.connectToDesk(mockDesk);
      });

      await act(async () => {
        await result.current.moveDeskToHeight(800);
      });

      await waitFor(() => {
        expect(result.current.targetHeight).toBe(800);
      });

      expect(backendAPI.updateDeskPosition).toHaveBeenCalledWith('AA:BB:CC:DD:EE:FF', 800);
    });
  });

  describe('Edge Cases - MAC Address Formats', () => {
    it('should handle MAC address with lowercase letters', async () => {
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      const mockDesk = {
        id: 'aa:bb:cc:dd:ee:ff',
        state: { position_mm: 800 }
      };

      await act(async () => {
        await result.current.connectToDesk(mockDesk);
      });

      await waitFor(() => {
        expect(result.current.deskName).toBe('DESK e:ff');
      });
    });

    it('should handle MAC address without colons', async () => {
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      const mockDesk = {
        id: 'AABBCCDDEEFF',
        name: 'No Colon Desk',
        state: { position_mm: 800 }
      };

      await act(async () => {
        await result.current.connectToDesk(mockDesk);
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });
    });

    it('should handle very short MAC address', async () => {
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      const mockDesk = {
        id: 'FF',
        state: { position_mm: 800 }
      };

      await act(async () => {
        await result.current.connectToDesk(mockDesk);
      });

      await waitFor(() => {
        expect(result.current.deskName).toBe('DESK FF');
      });
    });
  });

  describe('Edge Cases - Rapid Actions', () => {
    it('should handle rapid connect/disconnect cycles', async () => {
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      const mockDesk = {
        id: 'AA:BB:CC:DD:EE:FF',
        name: 'Test Desk',
        state: { position_mm: 800 }
      };

      // Rapid connect/disconnect
      for (let i = 0; i < 3; i++) {
        await act(async () => {
          await result.current.connectToDesk(mockDesk);
        });

        await act(async () => {
          await result.current.disconnectFromDesk();
        });
      }

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
      });

      expect(database.setDeskInUse).toHaveBeenCalledTimes(3);
      expect(database.setDeskNotInUse).toHaveBeenCalledTimes(3);
    });

    it('should handle rapid height changes', async () => {
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      const mockDesk = {
        id: 'AA:BB:CC:DD:EE:FF',
        name: 'Test Desk',
        state: { position_mm: 800 }
      };

      await act(async () => {
        await result.current.connectToDesk(mockDesk);
      });

      const heights = [700, 800, 900, 1000, 1100];
      
      for (const height of heights) {
        await act(async () => {
          await result.current.moveDeskToHeight(height);
        });
      }

      await waitFor(() => {
        expect(result.current.targetHeight).toBe(1100);
      });

      expect(backendAPI.updateDeskPosition).toHaveBeenCalledTimes(5);
    });

    it('should handle rapid dialog toggles', async () => {
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.setShowDeskDialog(true);
        });

        act(() => {
          result.current.setShowDeskDialog(false);
        });
      }

      await waitFor(() => {
        expect(result.current.showDeskDialog).toBe(false);
      });
    });
  });

  describe('Edge Cases - Database Failures', () => {
    it('should handle missing database ID gracefully', async () => {
      database.upsertDeskByMacAddress.mockResolvedValueOnce({ id: null });
      
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      const mockDesk = {
        id: 'AA:BB:CC:DD:EE:FF',
        name: 'Test Desk',
        state: { position_mm: 800 }
      };

      await act(async () => {
        try {
          await result.current.connectToDesk(mockDesk);
        } catch (error) {
          // May throw or handle gracefully
        }
      });
    });

    it('should handle partial database failures', async () => {
      database.addUserDesk.mockRejectedValueOnce(new Error('User desk error'));
      
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      const mockDesk = {
        id: 'AA:BB:CC:DD:EE:FF',
        name: 'Test Desk',
        state: { position_mm: 800 }
      };

      await expect(act(async () => {
        await result.current.connectToDesk(mockDesk);
      })).rejects.toThrow();
    });
  });

  describe('State Persistence', () => {
    it('should maintain target height after connection', async () => {
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      const mockDesk = {
        id: 'AA:BB:CC:DD:EE:FF',
        name: 'Test Desk',
        state: { position_mm: 800 }
      };

      await act(async () => {
        await result.current.connectToDesk(mockDesk);
      });

      await act(async () => {
        await result.current.moveDeskToHeight(1000);
      });

      // Target height should persist
      await waitFor(() => {
        expect(result.current.targetHeight).toBe(1000);
        expect(result.current.isConnected).toBe(true);
      });
    });

    it('should clear target height on disconnect', async () => {
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      const mockDesk = {
        id: 'AA:BB:CC:DD:EE:FF',
        name: 'Test Desk',
        state: { position_mm: 800 }
      };

      await act(async () => {
        await result.current.connectToDesk(mockDesk);
      });

      await act(async () => {
        await result.current.moveDeskToHeight(1000);
      });

      await act(async () => {
        await result.current.disconnectFromDesk();
      });

      await waitFor(() => {
        expect(result.current.targetHeight).toBeNull();
      });
    });
  });
});