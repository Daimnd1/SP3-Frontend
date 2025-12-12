-- Add desk usage tracking columns
-- Tracks which user is currently using a desk and when they last connected

ALTER TABLE public.desk 
ADD COLUMN is_in_use boolean DEFAULT false,
ADD COLUMN current_user_id uuid REFERENCES public.user(id) ON DELETE SET NULL,
ADD COLUMN name text DEFAULT 'Smart Desk',
ADD COLUMN mac_address text UNIQUE;

-- Add last_connected_at to users_desks for auto-reconnect feature
ALTER TABLE public.users_desks
ADD COLUMN last_connected_at timestamp with time zone;

-- Create index for faster lookups of in-use desks
CREATE INDEX idx_desk_is_in_use ON public.desk(is_in_use);
CREATE INDEX idx_desk_current_user ON public.desk(current_user_id);
CREATE INDEX idx_users_desks_last_connected ON public.users_desks(user_id, last_connected_at DESC);

COMMENT ON COLUMN public.desk.is_in_use IS 'True if a user is currently connected to this desk';
COMMENT ON COLUMN public.desk.current_user_id IS 'ID of the user currently using this desk (NULL if not in use)';
COMMENT ON COLUMN public.desk.name IS 'Friendly name for the desk (e.g., "Standing Desk Office")';
COMMENT ON COLUMN public.desk.mac_address IS 'MAC address or unique identifier from backend API';
COMMENT ON COLUMN public.users_desks.last_connected_at IS 'Timestamp of last connection for auto-reconnect feature';
