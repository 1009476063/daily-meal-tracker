-- Add multi-photo support
ALTER TABLE meal_meals ADD COLUMN IF NOT EXISTS photo_urls jsonb DEFAULT '[]'::jsonb;
ALTER TABLE meal_meals ADD COLUMN IF NOT EXISTS photo_storage_keys jsonb DEFAULT '[]'::jsonb;

-- Migrate existing single photo to array format
UPDATE meal_meals 
SET photo_urls = CASE WHEN photo_url IS NOT NULL THEN jsonb_build_array(photo_url) ELSE '[]'::jsonb END,
    photo_storage_keys = CASE WHEN photo_storage_key IS NOT NULL THEN jsonb_build_array(photo_storage_key) ELSE '[]'::jsonb END
WHERE photo_urls = '[]'::jsonb OR photo_urls IS NULL;
