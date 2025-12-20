import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
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

describe('DeskContext Snapshot Tests', () => {
  it('should match initial state snapshot', () => {
    const { result } = renderHook(() => useDesk(), {
      wrapper: AllTheProviders
    });

    expect(result.current).toMatchSnapshot();
  });
});