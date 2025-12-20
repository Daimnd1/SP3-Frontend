import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { PostureTimerProvider, usePostureTimer } from '../PostureTimerContext';

vi.mock('../AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user' } })
}));

vi.mock('../DeskContext', () => ({
  useDesk: () => ({
    selectedDesk: 'desk1',
    deskData: { state: { position_mm: 800 } }
  })
}));

describe('PostureTimerContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should provide timer context to children', () => {
    const { result } = renderHook(() => usePostureTimer(), {
      wrapper: PostureTimerProvider
    });

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('isTracking');
    expect(result.current).toHaveProperty('startTracking');
    expect(result.current).toHaveProperty('stopTracking');
  });

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => usePostureTimer());
    }).toThrow('usePostureTimer must be used within PostureTimerProvider');
  });

  it('should initialize with tracking stopped', () => {
    const { result } = renderHook(() => usePostureTimer(), {
      wrapper: PostureTimerProvider
    });

    expect(result.current.isTracking).toBe(false);
  });

  it('should start tracking when startTracking is called', () => {
    const { result } = renderHook(() => usePostureTimer(), {
      wrapper: PostureTimerProvider
    });

    act(() => {
      result.current.startTracking();
    });

    expect(result.current.isTracking).toBe(true);
  });

  it('should stop tracking when stopTracking is called', () => {
    const { result } = renderHook(() => usePostureTimer(), {
      wrapper: PostureTimerProvider
    });

    act(() => {
      result.current.startTracking();
    });

    act(() => {
      result.current.stopTracking();
    });

    expect(result.current.isTracking).toBe(false);
  });

  it('should track sitting time when position is sitting', () => {
    const { result } = renderHook(() => usePostureTimer(), {
      wrapper: PostureTimerProvider
    });

    act(() => {
      result.current.startTracking();
    });

    expect(result.current.sittingTime).toBeGreaterThanOrEqual(0);
  });

  it('should increment time elapsed when tracking', () => {
    const { result } = renderHook(() => usePostureTimer(), {
      wrapper: PostureTimerProvider
    });

    act(() => {
      result.current.startTracking();
    });

    act(() => {
      vi.advanceTimersByTime(5000); // 5 seconds
    });

    expect(result.current.totalTime).toBeGreaterThan(0);
  });

  it('should reset timer when reset is called', () => {
    const { result } = renderHook(() => usePostureTimer(), {
      wrapper: PostureTimerProvider
    });

    act(() => {
      result.current.startTracking();
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    act(() => {
      result.current.resetTimer();
    });

    expect(result.current.totalTime).toBe(0);
    expect(result.current.sittingTime).toBe(0);
    expect(result.current.standingTime).toBe(0);
  });
});