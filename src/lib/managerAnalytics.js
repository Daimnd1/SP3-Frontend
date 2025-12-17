// Manager analytics service for organization-wide posture data
import { supabase } from './supabase';
import { calculatePostureBalance } from './postureAnalytics';

/**
 * Get all users with their profile data
 */
export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      user_id,
      role,
      created_at
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get user statistics ranked by posture balance
 * Returns users sorted by how balanced their sitting/standing ratio is (50/50 is perfect)
 */
export async function getUserPostureRankings(days = 7) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get all sessions for all users in the time range
  const { data: sessions, error } = await supabase
    .from('posture_sessions')
    .select('user_id, mode, duration_ms')
    .gte('start_time', startDate.toISOString())
    .lte('start_time', endDate.toISOString())
    .not('duration_ms', 'is', null);

  if (error) throw error;

  // Group by user and calculate totals
  const userStats = {};
  
  sessions.forEach(session => {
    if (!userStats[session.user_id]) {
      userStats[session.user_id] = {
        user_id: session.user_id,
        total_sitting_ms: 0,
        total_standing_ms: 0,
        total_sessions: 0
      };
    }
    
    const stats = userStats[session.user_id];
    stats.total_sessions++;
    
    if (session.mode === 'sitting') {
      stats.total_sitting_ms += session.duration_ms;
    } else if (session.mode === 'standing') {
      stats.total_standing_ms += session.duration_ms;
    }
  });

  // Calculate balance score for each user
  const rankings = Object.values(userStats).map(stats => {
    const balance = calculatePostureBalance(stats.total_sitting_ms, stats.total_standing_ms);
    
    // Balance score: closer to 50/50 is better (0 = perfect, 50 = worst)
    const balanceScore = Math.abs(50 - balance.sitting);
    
    // Total active time in hours
    const totalActiveHours = (stats.total_sitting_ms + stats.total_standing_ms) / 3600000;
    
    return {
      user_id: stats.user_id,
      total_sitting_ms: stats.total_sitting_ms,
      total_standing_ms: stats.total_standing_ms,
      sitting_percentage: balance.sitting,
      standing_percentage: balance.standing,
      balance_score: balanceScore,
      total_active_hours: totalActiveHours.toFixed(1),
      total_sessions: stats.total_sessions,
      avg_sitting_hours: (stats.total_sitting_ms / 3600000).toFixed(1),
      avg_standing_hours: (stats.total_standing_ms / 3600000).toFixed(1)
    };
  });

  // Sort by balance score (best balance first)
  rankings.sort((a, b) => a.balance_score - b.balance_score);

  return rankings;
}

/**
 * Get organization-wide statistics
 */
export async function getOrganizationStats(days = 7) {
  const rankings = await getUserPostureRankings(days);
  
  if (rankings.length === 0) {
    return {
      total_users: 0,
      avg_sitting_percentage: 0,
      avg_standing_percentage: 0,
      avg_balance_score: 0,
      most_balanced_user: null,
      least_balanced_user: null
    };
  }

  const avgSitting = rankings.reduce((sum, u) => sum + u.sitting_percentage, 0) / rankings.length;
  const avgStanding = rankings.reduce((sum, u) => sum + u.standing_percentage, 0) / rankings.length;
  const avgBalance = rankings.reduce((sum, u) => sum + u.balance_score, 0) / rankings.length;

  return {
    total_users: rankings.length,
    avg_sitting_percentage: Math.round(avgSitting),
    avg_standing_percentage: Math.round(avgStanding),
    avg_balance_score: avgBalance.toFixed(1),
    most_balanced_user: rankings[0],
    least_balanced_user: rankings[rankings.length - 1]
  };
}

/**
 * Get user's email/username by user_id
 */
export async function getUserEmail(userId) {
  const { data, error } = await supabase
    .from('user')
    .select('email, username')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user email:', error);
    return { username: userId.slice(0, 8) + '...', email: null };
  }
  
  if (!data) {
    // User not found in user table, show truncated ID
    return { username: userId.slice(0, 8) + '...', email: null };
  }
  
  return data;
}
