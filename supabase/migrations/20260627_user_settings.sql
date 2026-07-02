-- User settings table
CREATE TABLE IF NOT EXISTS meal_user_settings (
  user_id uuid PRIMARY KEY REFERENCES meal_users(id) ON DELETE CASCADE,
  ai_base_url text,
  ai_api_key text,
  ai_model text,
  daily_kcal_target integer DEFAULT 2000,
  daily_protein_target integer DEFAULT 65,
  daily_fat_target integer DEFAULT 60,
  daily_carb_target integer DEFAULT 300,
  daily_fiber_target integer DEFAULT 25,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE meal_user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own settings" ON meal_user_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
