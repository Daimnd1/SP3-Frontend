-- Add sitting and standing preset heights to user_desk_presets
-- These store the user's preferred heights for each desk

ALTER TABLE public.user_desk_presets
ADD COLUMN sitting_height integer DEFAULT 75,
ADD COLUMN standing_height integer DEFAULT 110;
DROP COLUMN IF EXISTS desk_height;

-- Update existing records to have default values
UPDATE public.user_desk_presets
SET sitting_height = 75, standing_height = 110
WHERE sitting_height IS NULL OR standing_height IS NULL;

COMMENT ON COLUMN public.user_desk_presets.sitting_height IS 'User preferred sitting height in cm for this desk';
COMMENT ON COLUMN public.user_desk_presets.standing_height IS 'User preferred standing height in cm for this desk';