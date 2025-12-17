// Analytics and reporting service for posture data
import { getPostureSessions, getPostureChanges } from './postureData';

/**
 * Calculate daily statistics for a specific date
 */
export async function calculateDailyStats(userId, date) {
  // Get all sessions for the specified date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const sessions = await getPostureSessions(
    userId,
    startOfDay.toISOString(),
    endOfDay.toISOString()
  );

  const changes = await getPostureChanges(
    userId,
    startOfDay.toISOString(),
    endOfDay.toISOString()
  );

  // Calculate totals
  let totalSittingMs = 0;
  let totalStandingMs = 0;
  let sittingSessions = 0;
  let standingSessions = 0;

  sessions.forEach(session => {
    const duration = session.duration_ms || 0;
    if (session.mode === 'sitting') {
      totalSittingMs += duration;
      sittingSessions++;
    } else if (session.mode === 'standing') {
      totalStandingMs += duration;
      standingSessions++;
    }
  });

  return {
    date,
    total_sitting_ms: totalSittingMs,
    total_standing_ms: totalStandingMs,
    posture_changes_count: changes.length,
    avg_sitting_session_ms: sittingSessions > 0 ? totalSittingMs / sittingSessions : 0,
    avg_standing_session_ms: standingSessions > 0 ? totalStandingMs / standingSessions : 0,
    total_sessions: sessions.length
  };
}

/**
 * Get daily statistics for multiple days
 */
export async function getWeeklyStats(userId, days = 7) {
  const stats = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const dayStats = await calculateDailyStats(userId, date);
    stats.push(dayStats);
  }

  return stats;
}

/**
 * Format milliseconds to hours:minutes format
 */
export function formatDuration(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

/**
 * Convert milliseconds to hours (decimal)
 */
export function msToHours(ms) {
  return (ms / 3600000).toFixed(1);
}

/**
 * Get posture change frequency analysis
 */
export async function getPostureChangeFrequency(userId, days = 7) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const changes = await getPostureChanges(
    userId,
    startDate.toISOString(),
    endDate.toISOString()
  );

  // Group by day
  const changesByDay = {};
  changes.forEach(change => {
    const day = new Date(change.changed_at).toLocaleDateString();
    changesByDay[day] = (changesByDay[day] || 0) + 1;
  });

  return changesByDay;
}

/**
 * Get session duration distribution
 */
export async function getSessionDurationDistribution(userId, days = 7) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const sessions = await getPostureSessions(
    userId,
    startDate.toISOString(),
    endDate.toISOString()
  );

  const distribution = {
    'short': 0,    // < 15 min
    'medium': 0,   // 15-30 min
    'long': 0,     // 30-60 min
    'veryLong': 0  // > 60 min
  };

  sessions.forEach(session => {
    const minutes = (session.duration_ms || 0) / 60000;
    if (minutes < 15) distribution.short++;
    else if (minutes < 30) distribution.medium++;
    else if (minutes < 60) distribution.long++;
    else distribution.veryLong++;
  });

  return distribution;
}

/**
 * Calculate posture balance percentage
 */
export function calculatePostureBalance(totalSittingMs, totalStandingMs) {
  const total = totalSittingMs + totalStandingMs;
  if (total === 0) return { sitting: 0, standing: 0 };

  return {
    sitting: Math.round((totalSittingMs / total) * 100),
    standing: Math.round((totalStandingMs / total) * 100)
  };
}
