import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { DeskProvider, useDesk } from '../DeskContext';
import React from 'react';

// Mock ALL the context dependencies
vi.mock('../AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user-id' } })
}));

vi.mock('../PostureTimerContext', () => ({
  usePostureTimer: () => ({
    isTracking: false,
    changeMode: vi.fn()
  })
}));

// Mock the API modules
vi.mock('../../lib/backendAPI', () => ({
  getAllDesks: vi.fn(() => Promise.resolve([])),
  getDeskData: vi.fn(() => Promise.resolve({
    config: { name: 'Test Desk', id: 'desk1' },
    state: { position_mm: 800, speed_mms: 0 }
  })),
  updateDeskPosition: vi.fn(() => Promise.resolve({ success: true }))
}));

vi.mock('../../lib/database', () => ({
  upsertDeskByMacAddress: vi.fn(() => Promise.resolve({ id: 'db-desk-1' })),
  setDeskInUse: vi.fn(() => Promise.resolve()),
  setDeskNotInUse: vi.fn(() => Promise.resolve()),
  addUserDesk: vi.fn(() => Promise.resolve()),
  updateLastConnected: vi.fn(() => Promise.resolve()),
  getLastConnectedDesk: vi.fn(() => Promise.resolve(null)),
  getAllDesksWithStatus: vi.fn(() => Promise.resolve([])),
  updateDeskHeight: vi.fn(() => Promise.resolve()),
  getUserDeskPreset: vi.fn(() => Promise.resolve(null))
}));

// Create a wrapper that includes all required providers
const AllTheProviders = ({ children }) => {
  return <DeskProvider>{children}</DeskProvider>;
};

describe('DeskContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide desk context to children', async () => {
    const { result } = renderHook(() => useDesk(), {
      wrapper: AllTheProviders
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current).not.toBeNull();
    });
  });

  it('should have isConnected property', async () => {
    const { result } = renderHook(() => useDesk(), {
      wrapper: AllTheProviders
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('isConnected');
      expect(typeof result.current.isConnected).toBe('boolean');
    });
  });

  it('should have deskId property', async () => {
    const { result } = renderHook(() => useDesk(), {
      wrapper: AllTheProviders
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('deskId');
    });
  });

  it('should have deskName property', async () => {
    const { result } = renderHook(() => useDesk(), {
      wrapper: AllTheProviders
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('deskName');
    });
  });

  it('should have currentHeight property', async () => {
    const { result } = renderHook(() => useDesk(), {
      wrapper: AllTheProviders
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('currentHeight');
      expect(typeof result.current.currentHeight).toBe('number');
    });
  });

  it('should have connectToDesk function', async () => {
    const { result } = renderHook(() => useDesk(), {
      wrapper: AllTheProviders
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('connectToDesk');
      expect(typeof result.current.connectToDesk).toBe('function');
    });
  });

  it('should have disconnectFromDesk function', async () => {
    const { result } = renderHook(() => useDesk(), {
      wrapper: AllTheProviders
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('disconnectFromDesk');
      expect(typeof result.current.disconnectFromDesk).toBe('function');
    });
  });

  it('should have moveDeskToHeight function', async () => {
    const { result } = renderHook(() => useDesk(), {
      wrapper: AllTheProviders
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('moveDeskToHeight');
      expect(typeof result.current.moveDeskToHeight).toBe('function');
    });
  });

  it('should have showDeskDialog property', async () => {
    const { result } = renderHook(() => useDesk(), {
      wrapper: AllTheProviders
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('showDeskDialog');
      expect(typeof result.current.showDeskDialog).toBe('boolean');
    });
  });

  it('should initialize with disconnected state', async () => {
    const { result } = renderHook(() => useDesk(), {
      wrapper: AllTheProviders
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current.isConnected).toBe(false);
      expect(result.current.deskId).toBeNull();
      expect(result.current.currentHeight).toBe(0);
    });
  });
});