-- Add sitting and standing preset heights to user_desk_presets
-- These store the user's global height preferences (not desk-specific)

ALTER TABLE public.user_desk_presets
ADD COLUMN IF NOT EXISTS sitting_height integer DEFAULT 750,
ADD COLUMN IF NOT EXISTS standing_height integer DEFAULT 1100;

ALTER TABLE public.user_desk_presets
DROP COLUMN IF EXISTS desk_height;

-- Make notification_frequency nullable (it's optional)
ALTER TABLE public.user_desk_presets
ALTER COLUMN notification_frequency DROP NOT NULL;

-- Add unique constraint on user_id (one preset per user)
ALTER TABLE public.user_desk_presets
DROP CONSTRAINT IF EXISTS user_desk_presets_user_id_key;

ALTER TABLE public.user_desk_presets
ADD CONSTRAINT user_desk_presets_user_id_key UNIQUE (user_id);

-- Update existing records to have default values
UPDATE public.user_desk_presets
SET sitting_height = 750, standing_height = 1100
WHERE sitting_height IS NULL OR standing_height IS NULL;

COMMENT ON COLUMN public.user_desk_presets.sitting_height IS 'User preferred sitting height in mm (applies to all desks)';
COMMENT ON COLUMN public.user_desk_presets.standing_height IS 'User preferred standing height in mm (applies to all desks)';