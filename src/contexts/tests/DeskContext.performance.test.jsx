import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DeskProvider, useDesk } from '../DeskContext';
import React from 'react';

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

describe('DeskContext Performance Tests', () => {
  it('should render context provider quickly', () => {
    const start = performance.now();
    
    renderHook(() => useDesk(), {
      wrapper: AllTheProviders
    });
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100); // Should render in less than 100ms
  });

  it('should handle 100 dialog toggles efficiently', () => {
    const { result } = renderHook(() => useDesk(), {
      wrapper: AllTheProviders
    });

    const start = performance.now();
    
    for (let i = 0; i < 100; i++) {
      act(() => {
        result.current.setShowDeskDialog(i % 2 === 0);
      });
    }
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
  });
});