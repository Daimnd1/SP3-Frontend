// Data collection service for posture tracking
import { supabase } from './supabase';

/**
 * Create a new posture session
 */
export async function createPostureSession(userId, deskId, mode, heightMm) {
  const { data, error } = await supabase
    .from('posture_sessions')
    .insert({
      user_id: userId,
      desk_id: deskId,
      mode,
      start_height_mm: heightMm,
      start_time: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * End a posture session
 */
export async function endPostureSession(sessionId, endHeightMm, durationMs) {
  const { error } = await supabase
    .from('posture_sessions')
    .update({
      end_time: new Date().toISOString(),
      end_height_mm: endHeightMm,
      duration_ms: durationMs
    })
    .eq('id', sessionId);

  if (error) throw error;
}

/**
 * Log a posture change event
 */
export async function logPostureChange(userId, deskId, fromMode, toMode, heightMm) {
  const { error } = await supabase
    .from('posture_changes')
    .insert({
      user_id: userId,
      desk_id: deskId,
      from_mode: fromMode,
      to_mode: toMode,
      height_mm: heightMm,
      changed_at: new Date().toISOString()
    });

  if (error) throw error;
}

/**
 * Get posture sessions for a date range
 */
export async function getPostureSessions(userId, startDate, endDate) {
  const { data, error } = await supabase
    .from('posture_sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('start_time', startDate)
    .lte('start_time', endDate)
    .order('start_time', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Get posture changes for a date range
 */
export async function getPostureChanges(userId, startDate, endDate) {
  const { data, error } = await supabase
    .from('posture_changes')
    .select('*')
    .eq('user_id', userId)
    .gte('changed_at', startDate)
    .lte('changed_at', endDate)
    .order('changed_at', { ascending: true });

  if (error) throw error;
  return data;
}
