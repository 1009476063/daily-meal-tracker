import { NextResponse } from "next/server";

// Run migration DDL statements directly via Supabase REST SQL endpoint
// Uses the pg-meta API that Supabase exposes at /pg/ or /rest/v1/rpc/
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Missing env" }, { status: 500 });
  }

  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) {
    return NextResponse.json({ error: "Cannot parse project ref" }, { status: 500 });
  }

  const statements = [
    "ALTER TABLE meal_meals ADD COLUMN IF NOT EXISTS person_count integer DEFAULT 1",
    "ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS per_person boolean DEFAULT false",
    "ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS saturated_fat_g numeric",
    "ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS sodium_mg numeric",
    "ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS calcium_mg numeric",
    "ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS iron_mg numeric",
    "ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS vitamin_c_mg numeric",
    "ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS vitamin_a_mcg numeric",
    "ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS sugar_g numeric",
    "ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS cholesterol_mg numeric",
    "ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS food_group text",
    "ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS dietary_advice text",
    "ALTER TABLE meal_daily_summary ADD COLUMN IF NOT EXISTS total_fiber_g numeric DEFAULT 0",
    "ALTER TABLE meal_daily_summary ADD COLUMN IF NOT EXISTS total_sodium_mg numeric DEFAULT 0",
    "ALTER TABLE meal_daily_summary ADD COLUMN IF NOT EXISTS total_sugar_g numeric DEFAULT 0",
    "ALTER TABLE meal_daily_summary ADD COLUMN IF NOT EXISTS total_saturated_fat_g numeric DEFAULT 0",
    "ALTER TABLE meal_daily_summary ADD COLUMN IF NOT EXISTS total_calcium_mg numeric DEFAULT 0",
    "ALTER TABLE meal_daily_summary ADD COLUMN IF NOT EXISTS total_iron_mg numeric DEFAULT 0",
    "ALTER TABLE meal_meals ADD COLUMN IF NOT EXISTS meal_advice text",
    "ALTER TABLE meal_meals ADD COLUMN IF NOT EXISTS dietary_structure_advice text",
  ];

  const results: { sql: string; ok: boolean; error?: string }[] = [];

  for (const stmt of statements) {
    try {
      // Use Supabase's SQL endpoint via postgrest with raw SQL capability
      // Actually, we need to use the pg-meta service
      // Try using supabase-js raw SQL through a workaround: create a function first
      const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ query: stmt }),
      });
      const json = await res.json();
      if (!res.ok) {
        results.push({ sql: stmt.slice(0, 60), ok: false, error: JSON.stringify(json) });
      } else {
        results.push({ sql: stmt.slice(0, 60), ok: true });
      }
    } catch (e) {
      results.push({ sql: stmt.slice(0, 60), ok: false, error: e instanceof Error ? e.message : "unknown" });
    }
  }

  return NextResponse.json({ results });
}
