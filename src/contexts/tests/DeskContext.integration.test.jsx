import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { DeskProvider, useDesk } from '../DeskContext';
import React from 'react';
import * as backendAPI from '../../lib/backendAPI';
import * as database from '../../lib/database';

// Mock the context dependencies
vi.mock('../AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user-123' } })
}));

vi.mock('../PostureTimerContext', () => ({
  usePostureTimer: () => ({
    isTracking: false,
    changeMode: vi.fn()
  })
}));

// Mock the API modules
vi.mock('../../lib/backendAPI');
vi.mock('../../lib/database');

const AllTheProviders = ({ children }) => {
  return <DeskProvider>{children}</DeskProvider>;
};

describe('DeskContext Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up default mocks
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

  describe('Initial State', () => {
    it('should initialize with default disconnected state', async () => {
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
        expect(result.current.deskId).toBeNull();
        expect(result.current.deskName).toBe('');
        expect(result.current.currentHeight).toBe(0);
        expect(result.current.speed).toBe(0);
        expect(result.current.targetHeight).toBeNull();
        expect(result.current.showDeskDialog).toBe(false);
      });
    });
  });

  describe('Desk Connection Flow', () => {
    it('should connect to a desk successfully', async () => {
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      const mockDesk = {
        id: 'AA:BB:CC:DD:EE:FF',
        name: 'Standing Desk 1',
        state: { position_mm: 850 }
      };

      await act(async () => {
        await result.current.connectToDesk(mockDesk);
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
        expect(result.current.deskId).toBe('AA:BB:CC:DD:EE:FF');
        expect(result.current.deskName).toBe('Standing Desk 1');
        expect(result.current.currentHeight).toBe(850);
        expect(result.current.dbDeskId).toBe('db-desk-1');
      });

      // Verify database operations
      expect(database.upsertDeskByMacAddress).toHaveBeenCalledWith(
        'AA:BB:CC:DD:EE:FF',
        'Standing Desk 1',
        850
      );
      expect(database.setDeskInUse).toHaveBeenCalledWith('db-desk-1', 'test-user-123');
      expect(database.addUserDesk).toHaveBeenCalledWith('test-user-123', 'db-desk-1');
      expect(database.updateLastConnected).toHaveBeenCalledWith('test-user-123', 'db-desk-1');
    });

    it('should connect with mac_address field', async () => {
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      const mockDesk = {
        id: 'desk-1',
        mac_address: 'AA:BB:CC:DD:EE:FF',
        name: 'Test Desk',
        state: { position_mm: 900 }
      };

      await act(async () => {
        await result.current.connectToDesk(mockDesk);
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      expect(database.upsertDeskByMacAddress).toHaveBeenCalledWith(
        'AA:BB:CC:DD:EE:FF',
        'Test Desk',
        900
      );
    });

    it('should generate desk name if not provided', async () => {
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      const mockDesk = {
        id: 'AA:BB:CC:DD:EE:FF',
        state: { position_mm: 750 }
      };

      await act(async () => {
        await result.current.connectToDesk(mockDesk);
      });

      await waitFor(() => {
        expect(result.current.deskName).toBe('DESK E:FF');
      });
    });

    it('should disconnect from previous desk when connecting to new one', async () => {
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      // Connect to first desk
      const desk1 = {
        id: 'AA:BB:CC:DD:EE:01',
        name: 'Desk 1',
        state: { position_mm: 800 }
      };

      await act(async () => {
        await result.current.connectToDesk(desk1);
      });

      await waitFor(() => {
        expect(result.current.deskId).toBe('AA:BB:CC:DD:EE:01');
      });

      // Connect to second desk
      const desk2 = {
        id: 'AA:BB:CC:DD:EE:02',
        name: 'Desk 2',
        state: { position_mm: 900 }
      };

      await act(async () => {
        await result.current.connectToDesk(desk2);
      });

      await waitFor(() => {
        expect(result.current.deskId).toBe('AA:BB:CC:DD:EE:02');
        expect(result.current.deskName).toBe('Desk 2');
      });

      // Should have called setDeskNotInUse for first desk
      expect(database.setDeskNotInUse).toHaveBeenCalledWith('db-desk-1');
    });
  });

  describe('Desk Disconnection', () => {
    it('should disconnect and reset state', async () => {
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      // First connect
      const mockDesk = {
        id: 'AA:BB:CC:DD:EE:FF',
        name: 'Test Desk',
        state: { position_mm: 850 }
      };

      await act(async () => {
        await result.current.connectToDesk(mockDesk);
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Now disconnect
      await act(async () => {
        await result.current.disconnectFromDesk();
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
        expect(result.current.deskId).toBeNull();
        expect(result.current.deskName).toBe('');
        expect(result.current.currentHeight).toBe(0);
        expect(result.current.speed).toBe(0);
        expect(result.current.targetHeight).toBeNull();
        expect(result.current.dbDeskId).toBeNull();
      });

      expect(database.setDeskNotInUse).toHaveBeenCalledWith('db-desk-1');
    });
  });

  describe('Desk Height Control', () => {
    it('should move desk to target height when connected', async () => {
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      // Connect first
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

      // Move desk
      await act(async () => {
        await result.current.moveDeskToHeight(1100);
      });

      await waitFor(() => {
        expect(result.current.targetHeight).toBe(1100);
      });

      expect(backendAPI.updateDeskPosition).toHaveBeenCalledWith('AA:BB:CC:DD:EE:FF', 1100);
    });

    it('should not move desk when disconnected', async () => {
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
      });

      // Try to move
      await act(async () => {
        await result.current.moveDeskToHeight(1000);
      });

      // Should not call API
      expect(backendAPI.updateDeskPosition).not.toHaveBeenCalled();
    });

    it('should move to multiple heights in sequence', async () => {
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      // Connect
      const mockDesk = {
        id: 'AA:BB:CC:DD:EE:FF',
        name: 'Test Desk',
        state: { position_mm: 800 }
      };

      await act(async () => {
        await result.current.connectToDesk(mockDesk);
      });

      // Move to sitting
      await act(async () => {
        await result.current.moveDeskToHeight(750);
      });

      await waitFor(() => {
        expect(result.current.targetHeight).toBe(750);
      });

      // Move to standing
      await act(async () => {
        await result.current.moveDeskToHeight(1200);
      });

      await waitFor(() => {
        expect(result.current.targetHeight).toBe(1200);
      });

      expect(backendAPI.updateDeskPosition).toHaveBeenCalledTimes(2);
      expect(backendAPI.updateDeskPosition).toHaveBeenNthCalledWith(1, 'AA:BB:CC:DD:EE:FF', 750);
      expect(backendAPI.updateDeskPosition).toHaveBeenNthCalledWith(2, 'AA:BB:CC:DD:EE:FF', 1200);
    });
  });

  describe('Dialog State', () => {
    it('should toggle dialog state', async () => {
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      expect(result.current.showDeskDialog).toBe(false);

      act(() => {
        result.current.setShowDeskDialog(true);
      });

      await waitFor(() => {
        expect(result.current.showDeskDialog).toBe(true);
      });

      act(() => {
        result.current.setShowDeskDialog(false);
      });

      await waitFor(() => {
        expect(result.current.showDeskDialog).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors', async () => {
      database.upsertDeskByMacAddress.mockRejectedValueOnce(new Error('Database error'));
      
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
      })).rejects.toThrow('Database error');

      // Should remain disconnected
      expect(result.current.isConnected).toBe(false);
    });

    it('should handle desk movement errors', async () => {
      backendAPI.updateDeskPosition.mockRejectedValueOnce(new Error('API error'));
      
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      // Connect first
      const mockDesk = {
        id: 'AA:BB:CC:DD:EE:FF',
        name: 'Test Desk',
        state: { position_mm: 800 }
      };

      await act(async () => {
        await result.current.connectToDesk(mockDesk);
      });

      // Try to move (should fail)
      await expect(act(async () => {
        await result.current.moveDeskToHeight(1000);
      })).rejects.toThrow('API error');

      // Should still be connected
      expect(result.current.isConnected).toBe(true);
    });
  });

  describe('Complete User Workflows', () => {
    it('should complete a full desk usage session', async () => {
      const { result } = renderHook(() => useDesk(), {
        wrapper: AllTheProviders
      });

      // 1. Open dialog
      act(() => {
        result.current.setShowDeskDialog(true);
      });

      // 2. Connect to desk
      const mockDesk = {
        id: 'AA:BB:CC:DD:EE:FF',
        name: 'My Standing Desk',
        state: { position_mm: 750 }
      };

      await act(async () => {
        await result.current.connectToDesk(mockDesk);
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // 3. Move to standing
      await act(async () => {
        await result.current.moveDeskToHeight(1150);
      });

      // 4. Move to sitting
      await act(async () => {
        await result.current.moveDeskToHeight(780);
      });

      // 5. Disconnect
      await act(async () => {
        await result.current.disconnectFromDesk();
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
      });

      // Verify all operations
      expect(database.upsertDeskByMacAddress).toHaveBeenCalled();
      expect(database.setDeskInUse).toHaveBeenCalled();
      expect(backendAPI.updateDeskPosition).toHaveBeenCalledTimes(2);
      expect(database.setDeskNotInUse).toHaveBeenCalled();
    });
  });
});