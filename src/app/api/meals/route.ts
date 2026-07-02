import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase-server";


const itemSchema = z.object({
  name: z.string().min(1),
  ingredients: z.array(z.string()).default([]),
  portion_grams: z.number().nullable().optional(),
  kcal: z.number().nullable().optional(),
  protein_g: z.number().nullable().optional(),
  fat_g: z.number().nullable().optional(),
  carb_g: z.number().nullable().optional(),
  fiber_g: z.number().nullable().optional(),
  saturated_fat_g: z.number().nullable().optional(),
  sodium_mg: z.number().nullable().optional(),
  calcium_mg: z.number().nullable().optional(),
  iron_mg: z.number().nullable().optional(),
  vitamin_c_mg: z.number().nullable().optional(),
  vitamin_a_mcg: z.number().nullable().optional(),
  sugar_g: z.number().nullable().optional(),
  cholesterol_mg: z.number().nullable().optional(),
  food_group: z.string().nullable().optional(),
  dietary_advice: z.string().nullable().optional(),
  confidence: z.enum(["low", "medium", "high"]).optional(),
});

const schema = z.object({
  user_id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  photo_url: z.string().url().optional(),
  photo_storage_key: z.string().optional(),
  photo_urls: z.array(z.string().url()).optional(),
  photo_storage_keys: z.array(z.string()).optional(),
  source: z.enum(["ai", "manual"]).default("ai"),
  notes: z.string().optional(),
  person_count: z.number().int().min(1).max(20).default(1),
  meal_advice: z.string().nullable().optional(),
  dietary_structure_advice: z.string().nullable().optional(),
  items: z.array(itemSchema).min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  let { user_id, date, meal_type, photo_url, photo_storage_key, photo_urls, photo_storage_keys, source, notes, person_count, meal_advice, dietary_structure_advice, items } = parsed.data;

  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabase.auth.getUser(token);
    if (data.user) {
      user_id = data.user.id;
    }
  }

  const { data: existingUser } = await supabase
    .from("meal_users")
    .select("id")
    .eq("id", user_id)
    .maybeSingle();

  if (!existingUser) {
    const { error: createUserError } = await supabase.from("meal_users").upsert({
      id: user_id,
      email: `${user_id}@placeholder.local`,
      nickname: "未命名用户",
    });
    if (createUserError) {
      return NextResponse.json({ error: createUserError.message }, { status: 400 });
    }
  }


  const { data: meal, error: mealError } = await supabase
    .from("meal_meals")
    .insert({
      user_id,
      date,
      meal_type,
      photo_url,
      photo_storage_key,
      photo_urls: (photo_urls && photo_urls.length > 0) ? photo_urls : (photo_url ? [photo_url] : []),
      photo_storage_keys: (photo_storage_keys && photo_storage_keys.length > 0) ? photo_storage_keys : (photo_storage_key ? [photo_storage_key] : []),
      source,
      notes,
      person_count,
      meal_advice: meal_advice ?? null,
      dietary_structure_advice: dietary_structure_advice ?? null,
    })
    .select("id")
    .single();

  if (mealError) {
    return NextResponse.json({ error: mealError.message }, { status: 400 });
  }

  const mealItems = items.map((item) => ({
    meal_id: meal.id,
    name: item.name,
    ingredients: item.ingredients,
    portion_grams: item.portion_grams ?? null,
    kcal: item.kcal ?? null,
    protein_g: item.protein_g ?? null,
    fat_g: item.fat_g ?? null,
    carb_g: item.carb_g ?? null,
    fiber_g: item.fiber_g ?? null,
    saturated_fat_g: item.saturated_fat_g ?? null,
    sodium_mg: item.sodium_mg ?? null,
    calcium_mg: item.calcium_mg ?? null,
    iron_mg: item.iron_mg ?? null,
    vitamin_c_mg: item.vitamin_c_mg ?? null,
    vitamin_a_mcg: item.vitamin_a_mcg ?? null,
    sugar_g: item.sugar_g ?? null,
    cholesterol_mg: item.cholesterol_mg ?? null,
    food_group: item.food_group ?? null,
    dietary_advice: item.dietary_advice ?? null,
    confidence: item.confidence ?? null,
    is_manually_edited: source === "manual",
  }));

  const { error: itemsError } = await supabase.from("meal_items").insert(mealItems);
  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 400 });
  }

  return NextResponse.json({ meal_id: meal.id });
}
