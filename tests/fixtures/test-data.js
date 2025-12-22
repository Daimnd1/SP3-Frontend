/**
 * Test fixtures and helper functions
 * Reusable test data for all test suites
 */

export const mockUsers = {
  regularUser: {
    id: 'user_123',
    email: 'user@example.com',
    role: 'user',
    deskId: 'desk_001',
  },
  admin: {
    id: 'admin_123',
    email: 'admin@example.com',
    role: 'admin',
  },
};

export const mockDesks = {
  desk001: {
    id: 'desk_001',
    name: 'Standing Desk A',
    location: 'Floor 1, Zone A',
    currentHeight: 750,
    minHeight: 600,
    maxHeight: 1200,
  },
  desk002: {
    id: 'desk_002',
    name: 'Standing Desk B',
    location: 'Floor 1, Zone B',
    currentHeight: 850,
    minHeight: 600,
    maxHeight: 1200,
  },
};

export const mockPresets = {
  sitting: {
    id: 'p1',
    name: 'Sitting',
    height: 750,
  },
  standing: {
    id: 'p2',
    name: 'Standing',
    height: 1000,
  },
  elevated: {
    id: 'p3',
    name: 'Elevated',
    height: 1100,
  },
};

export const mockAnalyticsData = {
  weeklyData: {
    days: 7,
    totalSessions: 35,
    totalUsageMinutes: 2400,
    averageSessionLength: 68.57,
    postureChanges: 42,
    sittingPercentage: 60,
    standingPercentage: 40,
  },
  monthlyData: {
    days: 30,
    totalSessions: 150,
    totalUsageMinutes: 10800,
    averageSessionLength: 72,
    mostUsedHeight: 875,
    averageHeight: 875,
  },
};

export const mockNotifications = {
  postureChange: {
    type: 'posture_change',
    title: 'Time to change posture',
    message: "You've been in the same position for 30 minutes",
    priority: 'medium',
  },
  systemUpdate: {
    type: 'system_update',
    title: 'New firmware available',
    message: 'Desk firmware v2.2.0 is now available',
    priority: 'high',
  },
  maintenance: {
    type: 'maintenance',
    title: 'Scheduled maintenance',
    message: 'System maintenance on Dec 25, 2024 from 2-4 AM',
    priority: 'medium',
  },
};

/**
 * Helper function to create random desk ID
 */
export const generateDeskId = () => {
  return `desk_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Helper function to create random user ID
 */
export const generateUserId = () => {
  return `user_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Helper function to create random preset
 */
export const createMockPreset = (overrides = {}) => {
  return {
    id: `p${Math.random().toString(36).substr(2, 5)}`,
    name: 'Custom Preset',
    height: 850,
    ...overrides,
  };
};

/**
 * Helper function to create mock analytics event
 */
export const createMockEvent = (type, overrides = {}) => {
  return {
    type,
    userId: 'user_123',
    timestamp: new Date(),
    ...overrides,
  };
};

/**
 * Helper function to wait for async operations
 */
export const waitFor = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Helper to mock API responses with delay
 */
export const mockAPIResponse = (data, delayMs = 300) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delayMs);
  });
};
