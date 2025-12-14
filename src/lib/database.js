import { supabase } from "./supabase";

/**
 * Get all desks with their current usage status
 */
export const getAllDesksWithStatus = async () => {
  const { data, error } = await supabase
    .from("desk")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Get a specific desk by ID
 */
export const getDeskById = async (deskId) => {
  const { data, error } = await supabase
    .from("desk")
    .select("*")
    .eq("id", deskId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
};

/**
 * Get desk by MAC address (backend API ID)
 */
export const getDeskByMacAddress = async (macAddress) => {
  const { data, error } = await supabase
    .from("desk")
    .select("*")
    .eq("mac_address", macAddress)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
};

/**
 * Create or get desk by MAC address
 */
export const upsertDeskByMacAddress = async (macAddress, name, height) => {
  const existing = await getDeskByMacAddress(macAddress);

  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from("desk")
    .insert({
      mac_address: macAddress,
      name: name || "Smart Desk",
      height: height || 750,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Mark desk as in use by a user
 */
export const setDeskInUse = async (deskId, userId) => {
  const { error } = await supabase
    .from("desk")
    .update({
      is_in_use: true,
      current_user_id: userId,
    })
    .eq("id", deskId);

  if (error) throw error;
};

/**
 * Mark desk as not in use
 */
export const setDeskNotInUse = async (deskId) => {
  const { error } = await supabase
    .from("desk")
    .update({
      is_in_use: false,
      current_user_id: null,
    })
    .eq("id", deskId);

  if (error) throw error;
};

/**
 * Update desk height
 */
export const updateDeskHeight = async (deskId, height) => {
  const { error } = await supabase
    .from("desk")
    .update({ height })
    .eq("id", deskId);

  if (error) throw error;
};

/**
 * Get available desks (not in use)
 */
export const getAvailableDesks = async () => {
  const { data, error } = await supabase
    .from("desk")
    .select("*")
    .eq("is_in_use", false)
    .order("name");

  if (error) throw error;
  return data || [];
};

/**
 * Get all desks associated with a user
 */
export const getUserDesks = async (userId) => {
  const { data, error } = await supabase
    .from("users_desks")
    .select(
      `
      *,
      desk:desk_id (*)
    `
    )
    .eq("user_id", userId)
    .order("last_connected_at", { ascending: false, nullsFirst: false });

  if (error) throw error;
  return data || [];
};

/**
 * Get the last connected desk for a user
 */
export const getLastConnectedDesk = async (userId) => {
  const { data, error } = await supabase
    .from("users_desks")
    .select(
      `
      *,
      desk:desk_id (*)
    `
    )
    .eq("user_id", userId)
    .not("last_connected_at", "is", null)
    .order("last_connected_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
};

/**
 * Associate a desk with a user (or update existing association)
 */
export const addUserDesk = async (userId, deskId) => {
  // Check if relationship already exists
  const { data: existing, error: checkError } = await supabase
    .from("users_desks")
    .select("id")
    .eq("user_id", userId)
    .eq("desk_id", deskId)
    .maybeSingle();

  if (existing) {
    // Already exists, just return
    return existing;
  }

  const { data, error } = await supabase
    .from("users_desks")
    .insert({
      user_id: userId,
      desk_id: deskId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update last connected timestamp for a user-desk relationship
 */
export const updateLastConnected = async (userId, deskId) => {
  const { error } = await supabase
    .from("users_desks")
    .update({ last_connected_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("desk_id", deskId);

  if (error) throw error;
};

/**
 * Remove a user-desk association
 */
export const removeUserDesk = async (userId, deskId) => {
  const { error } = await supabase
    .from("users_desks")
    .delete()
    .eq("user_id", userId)
    .eq("desk_id", deskId);

  if (error) throw error;
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  const { data, error } = await supabase
    .from("user")
    .select("*")
    .eq("id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
};

/**
 * Update user notification frequency
 */
export const updateUserNotificationFrequency = async (userId, frequency) => {
  const { error } = await supabase
    .from("user")
    .update({ notification_frequency: frequency })
    .eq("id", userId);

  if (error) throw error;
};

/**
 * Update last notification timestamp
 */
export const updateLastNotification = async (userId) => {
  const { error } = await supabase
    .from("user")
    .update({ last_notification: new Date().toISOString() })
    .eq("id", userId);

  if (error) throw error;
};

/**
 * Create a notification record
 */
export const createNotification = async (userId, message, scheduledAt) => {
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      message,
      scheduled_at: scheduledAt || new Date().toISOString(),
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Mark notification as sent
 */
export const markNotificationSent = async (notificationId) => {
  const { error } = await supabase
    .from("notifications")
    .update({
      sent: true,
      sent_at: new Date().toISOString(),
      status: "sent",
    })
    .eq("id", notificationId);

  if (error) throw error;
};

/**
 * Get user notifications
 */
export const getUserNotifications = async (userId, limit = 50) => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

/**
 * Get user's global desk preset
 */
export const getUserDeskPreset = async (userId) => {
  const { data, error } = await supabase
    .from("user_desk_presets")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

/**
 * Create or update user's global desk preset
 */
export const upsertUserDeskPreset = async (
  userId,
  sittingHeight,
  standingHeight,
  notificationFrequency
) => {
  const { data, error } = await supabase
    .from("user_desk_presets")
    .upsert({
      user_id: userId,
      sitting_height: sittingHeight,
      standing_height: standingHeight,
      notification_frequency: notificationFrequency,
    }, {
      onConflict: 'user_id'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
