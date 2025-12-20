import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { DeskProvider, useDesk } from '../DeskContext';
import React from 'react';
import * as backendAPI from '../../lib/backendAPI';
import * as database from '../../lib/database';

// Mock modules
vi.mock('../../lib/backendAPI');
vi.mock('../../lib/database');

// Create mock functions
const mockChangeMode = vi.fn();

// Mock the contexts
vi.mock('../AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user-123' } })
}));

vi.mock('../PostureTimerContext', () => ({
  usePostureTimer: () => ({
    isTracking: true,
    changeMode: mockChangeMode
  })
}));

const AllTheProviders = ({ children }) => {
  return <DeskProvider>{children}</DeskProvider>;
};

describe('DeskContext - Branch Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default implementations
    backendAPI.getDeskData = vi.fn(() => Promise.resolve({
      config: { name: 'Test Desk' },
      state: { position_mm: 800, speed_mms: 0 }
    }));
    backendAPI.updateDeskPosition = vi.fn(() => Promise.resolve({ success: true }));
    
    database.upsertDeskByMacAddress = vi.fn(() => Promise.resolve({ id: 'db-desk-1' }));
    database.setDeskInUse = vi.fn(() => Promise.resolve());
    database.setDeskNotInUse = vi.fn(() => Promise.resolve());
    database.addUserDesk = vi.fn(() => Promise.resolve());
    database.updateLastConnected = vi.fn(() => Promise.resolve());
    database.updateDeskHeight = vi.fn(() => Promise.resolve());
  });

  describe('Branch: Already connected to desk (Line 198)', () => {
    it('should disconnect from previous desk when connecting to new one', async () => {
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      const desk1 = {
        id: 'AA:BB:CC:DD:EE:01',
        name: 'Desk 1',
        state: { position_mm: 800 }
      };

      await act(async () => {
        await result.current.connectToDesk(desk1);
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      const desk2 = {
        id: 'AA:BB:CC:DD:EE:02',
        name: 'Desk 2',
        state: { position_mm: 900 }
      };

      await act(async () => {
        await result.current.connectToDesk(desk2);
      });

      expect(database.setDeskNotInUse).toHaveBeenCalledWith('db-desk-1');
      expect(result.current.deskId).toBe('AA:BB:CC:DD:EE:02');
    });

    it('should not call setDeskNotInUse on first connection', async () => {
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

      expect(database.setDeskNotInUse).not.toHaveBeenCalled();
    });
  });

  describe('Branch: Database desk validation (Line 211)', () => {
    it('should throw error if dbDesk is null', async () => {
      database.upsertDeskByMacAddress = vi.fn(() => Promise.resolve(null));

      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      const mockDesk = {
        id: 'AA:BB:CC:DD:EE:FF',
        name: 'Test Desk',
        state: { position_mm: 800 }
      };

      await expect(
        act(async () => {
          await result.current.connectToDesk(mockDesk);
        })
      ).rejects.toThrow('Failed to get desk from database');
    });

    it('should throw error if dbDesk.id is missing', async () => {
      database.upsertDeskByMacAddress = vi.fn(() => Promise.resolve({ id: null }));

      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      const mockDesk = {
        id: 'AA:BB:CC:DD:EE:FF',
        name: 'Test Desk',
        state: { position_mm: 800 }
      };

      await expect(
        act(async () => {
          await result.current.connectToDesk(mockDesk);
        })
      ).rejects.toThrow('Failed to get desk from database');
    });
  });

  describe('Branch: Target height database update (Lines 93-97)', () => {
    it('should update database height when target reached', async () => {
      let pollCount = 0;
      backendAPI.getDeskData = vi.fn(() => {
        pollCount++;
        const isAtTarget = pollCount >= 3;
        return Promise.resolve({
          config: { name: 'Test Desk' },
          state: { 
            position_mm: isAtTarget ? 1000 : 900 + (pollCount * 30), 
            speed_mms: isAtTarget ? 0 : 10 
          }
        });
      });

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

      // Wait for real interval to poll
      await new Promise(resolve => setTimeout(resolve, 2000));

      await waitFor(() => {
        expect(database.updateDeskHeight).toHaveBeenCalledWith('db-desk-1', 1000);
      }, { timeout: 3000 });
    }, 10000); // 10 second test timeout
  });

  describe('Branch: Mode detection branches (Lines 159-189)', () => {
    it('should detect sitting position (< 900mm)', async () => {
      let pollCount = 0;
      backendAPI.getDeskData = vi.fn(() => {
        pollCount++;
        return Promise.resolve({
          config: { name: 'Test Desk' },
          state: { 
            position_mm: pollCount === 1 ? 1100 : 750, 
            speed_mms: 0 
          }
        });
      });

      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      const mockDesk = {
        id: 'AA:BB:CC:DD:EE:FF',
        name: 'Test Desk',
        state: { position_mm: 1100 }
      };

      await act(async () => {
        await result.current.connectToDesk(mockDesk);
      });

      // Wait for polling
      await new Promise(resolve => setTimeout(resolve, 1500));

      await waitFor(() => {
        expect(mockChangeMode).toHaveBeenCalledWith('sitting', 750, 'db-desk-1');
      }, { timeout: 2000 });
    }, 10000);

    it('should detect standing position (>= 900mm)', async () => {
      let pollCount = 0;
      backendAPI.getDeskData = vi.fn(() => {
        pollCount++;
        return Promise.resolve({
          config: { name: 'Test Desk' },
          state: { 
            position_mm: pollCount === 1 ? 750 : 1100, 
            speed_mms: 0 
          }
        });
      });

      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      const mockDesk = {
        id: 'AA:BB:CC:DD:EE:FF',
        name: 'Test Desk',
        state: { position_mm: 750 }
      };

      await act(async () => {
        await result.current.connectToDesk(mockDesk);
      });

      await new Promise(resolve => setTimeout(resolve, 1500));

      await waitFor(() => {
        expect(mockChangeMode).toHaveBeenCalledWith('standing', 1100, 'db-desk-1');
      }, { timeout: 2000 });
    }, 10000);

    it('should not change mode when height is 0', async () => {
      backendAPI.getDeskData = vi.fn(() => Promise.resolve({
        config: { name: 'Test Desk' },
        state: { position_mm: 0, speed_mms: 0 }
      }));

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

      mockChangeMode.mockClear();

      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(mockChangeMode).not.toHaveBeenCalled();
    });

    it('should not change mode when speed is not 0', async () => {
      backendAPI.getDeskData = vi.fn(() => Promise.resolve({
        config: { name: 'Test Desk' },
        state: { position_mm: 1100, speed_mms: 10 }
      }));

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

      mockChangeMode.mockClear();

      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(mockChangeMode).not.toHaveBeenCalled();
    });
  });

  describe('Branch: Polling interval cleanup (Lines 64-67)', () => {
    it('should clear interval when disconnected', async () => {
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

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      const pollCallsBefore = backendAPI.getDeskData.mock.calls.length;

      await act(async () => {
        await result.current.disconnectFromDesk();
      });

      // Wait and verify no more polling
      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(backendAPI.getDeskData.mock.calls.length).toBe(pollCallsBefore);
    });
  });

  describe('Branch: Error handling in polling (Line 139-146)', () => {
    it('should disconnect on 404 error', async () => {
      backendAPI.getDeskData = vi.fn()
        .mockResolvedValueOnce({
          config: { name: 'Test Desk' },
          state: { position_mm: 800, speed_mms: 0 }
        })
        .mockRejectedValue(new Error('Desk not found - 404'));

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

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Wait for error to trigger
      await new Promise(resolve => setTimeout(resolve, 1000));

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
      }, { timeout: 2000 });
    }, 10000);
  });
});