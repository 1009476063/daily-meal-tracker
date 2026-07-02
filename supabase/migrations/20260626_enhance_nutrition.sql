-- Add person_count and rich nutrition fields
ALTER TABLE meal_meals ADD COLUMN IF NOT EXISTS person_count integer DEFAULT 1;

ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS per_person boolean DEFAULT false;
ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS saturated_fat_g numeric;
ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS sodium_mg numeric;
ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS calcium_mg numeric;
ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS iron_mg numeric;
ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS vitamin_c_mg numeric;
ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS vitamin_a_mcg numeric;
ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS sugar_g numeric;
ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS cholesterol_mg numeric;
ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS food_group text;

ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS dietary_advice text;

-- Widen daily summary with full nutrition
ALTER TABLE meal_daily_summary ADD COLUMN IF NOT EXISTS total_fiber_g numeric DEFAULT 0;
ALTER TABLE meal_daily_summary ADD COLUMN IF NOT EXISTS total_sodium_mg numeric DEFAULT 0;
ALTER TABLE meal_daily_summary ADD COLUMN IF NOT EXISTS total_sugar_g numeric DEFAULT 0;
ALTER TABLE meal_daily_summary ADD COLUMN IF NOT EXISTS total_saturated_fat_g numeric DEFAULT 0;
ALTER TABLE meal_daily_summary ADD COLUMN IF NOT EXISTS total_calcium_mg numeric DEFAULT 0;
ALTER TABLE meal_daily_summary ADD COLUMN IF NOT EXISTS total_iron_mg numeric DEFAULT 0;

-- Add suggestions and advice to meals
ALTER TABLE meal_meals ADD COLUMN IF NOT EXISTS meal_advice text;
ALTER TABLE meal_meals ADD COLUMN IF NOT EXISTS dietary_structure_advice text;
