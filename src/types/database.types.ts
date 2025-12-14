// TypeScript types for existing Supabase database tables
// Based on current schema with usage tracking additions

export interface Desk {
  id: string;
  created_at: string;
  height: number;
  is_in_use: boolean;
  current_user_id: string | null;
  name: string;
  mac_address: string | null;
}

export interface DeskInsert {
  height: number;
  name?: string;
  mac_address?: string;
  is_in_use?: boolean;
  current_user_id?: string | null;
}

export interface DeskUpdate {
  height?: number;
  is_in_use?: boolean;
  current_user_id?: string | null;
  name?: string;
  mac_address?: string;
}

export interface User {
  id: string;
  created_at: string;
  username: string;
  password: string;
  email: string;
  age: number | null;
  height: number | null;
  weights: number | null;
  notification_frequency: number | null;
  last_notification: string | null;
}

export interface UserInsert {
  username: string;
  password: string;
  email: string;
  age?: number | null;
  height?: number | null;
  weights?: number | null;
  notification_frequency?: number | null;
  last_notification?: string | null;
}

export interface UserUpdate {
  username?: string;
  password?: string;
  email?: string;
  age?: number | null;
  height?: number | null;
  weights?: number | null;
  notification_frequency?: number | null;
  last_notification?: string | null;
}

export interface UserDesk {
  id: string;
  created_at: string;
  user_id: string;
  desk_id: string;
  last_connected_at: string | null;
}

export interface UserDeskInsert {
  user_id: string;
  desk_id: string;
  last_connected_at?: string | null;
}

export interface UserDeskUpdate {
  last_connected_at?: string | null;
}

export interface Notification {
  id: number;
  created_at: string;
  user_id: string | null;
  message: string;
  scheduled_at: string;
  sent: boolean;
  sent_at: string | null;
  status: string;
}

export interface NotificationInsert {
  user_id?: string | null;
  message?: string;
  scheduled_at?: string;
  sent?: boolean;
  sent_at?: string | null;
  status?: string;
}

export interface NotificationUpdate {
  message?: string;
  scheduled_at?: string;
  sent?: boolean;
  sent_at?: string | null;
  status?: string;
}

export interface UserDeskPreset {
  id: string;
  created_at: string;
  user_id: string;
  desk_height: number;
  notification_frequency: number;
}

export interface UserDeskPresetInsert {
  user_id: string;
  desk_height: number;
  notification_frequency: number;
}

export interface UserDeskPresetUpdate {
  desk_height?: number;
  notification_frequency?: number;
}

export interface GlobalPreset {
  id: string;
  created_at: string;
  desk_height: number;
}

export interface GlobalPresetInsert {
  desk_height: number;
}

export interface DeskGlobalPreset {
  id: string;
  created_at: string;
  desk_id: string;
  global_preset_id: string;
}

export interface DeskGlobalPresetInsert {
  desk_id: string;
  global_preset_id: string;
}

// Database interface combining all tables
export interface Database {
  public: {
    Tables: {
      desk: {
        Row: Desk;
        Insert: DeskInsert;
        Update: DeskUpdate;
      };
      user: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      users_desks: {
        Row: UserDesk;
        Insert: UserDeskInsert;
        Update: UserDeskUpdate;
      };
      notifications: {
        Row: Notification;
        Insert: NotificationInsert;
        Update: NotificationUpdate;
      };
      user_desk_presets: {
        Row: UserDeskPreset;
        Insert: UserDeskPresetInsert;
        Update: UserDeskPresetUpdate;
      };
      global_presets: {
        Row: GlobalPreset;
        Insert: GlobalPresetInsert;
        Update: never;
      };
      desk_global_presets: {
        Row: DeskGlobalPreset;
        Insert: DeskGlobalPresetInsert;
        Update: never;
      };
    };
  };
}
