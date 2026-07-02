import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getAuthUser } from "@/lib/auth";

function extractId(request: Request): string {
  return new URL(request.url).pathname.split("/").filter(Boolean).pop() ?? "";
}

export async function GET(request: Request) {
  const auth = await getAuthUser(request);
  if ("error" in auth) return auth.error;

  const id = extractId(request);
  const supabase = createSupabaseServerClient();

  const { data: meal, error } = await supabase
    .from("meal_meals")
    .select("id, user_id, date, meal_type, photo_url, photo_urls, photo_storage_key, photo_storage_keys, source, notes, person_count, meal_advice, dietary_structure_advice, created_at, meal_items(*)")
    .eq("id", id)
    .eq("user_id", auth.user.id) // only own data
    .single();

  if (error || !meal) {
    return NextResponse.json({ error: "记录不存在" }, { status: 404 });
  }

  return NextResponse.json(meal);
}

const itemSchema = z.object({
  id: z.string().uuid().optional(),
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

const updateSchema = z.object({
  meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
  photo_url: z.string().url().optional(),
  photo_storage_key: z.string().optional(),
  source: z.enum(["ai", "manual"]).optional(),
  notes: z.string().optional(),
  items: z.array(itemSchema).optional(),
});

export async function PATCH(request: Request) {
  const auth = await getAuthUser(request);
  if ("error" in auth) return auth.error;

  const id = extractId(request);
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();

  // Verify ownership
  const { data: existing } = await supabase.from("meal_meals").select("id").eq("id", id).eq("user_id", auth.user.id).single();
  if (!existing) return NextResponse.json({ error: "记录不存在" }, { status: 404 });

  const { items, ...mealFields } = parsed.data;

  if (Object.keys(mealFields).length) {
    const { error } = await supabase.from("meal_meals").update(mealFields).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (items) {
    const { error: delError } = await supabase.from("meal_items").delete().eq("meal_id", id);
    if (delError) return NextResponse.json({ error: delError.message }, { status: 400 });

    const mealItems = items.map((item) => ({
      id: item.id,
      meal_id: id,
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
      is_manually_edited: parsed.data.source === "manual",
    }));

    const { error: insError } = await supabase.from("meal_items").insert(mealItems);
    if (insError) return NextResponse.json({ error: insError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const auth = await getAuthUser(request);
  if ("error" in auth) return auth.error;

  const id = extractId(request);
  const supabase = createSupabaseServerClient();

  // Verify ownership and get photo keys for cleanup
  const { data: meal } = await supabase
    .from("meal_meals")
    .select("id, photo_storage_key, photo_storage_keys")
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .single();

  if (!meal) return NextResponse.json({ error: "记录不存在" }, { status: 404 });

  const { error } = await supabase.from("meal_meals").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Clean up R2 files (best-effort, don't fail the delete if cleanup fails)
  const keys: string[] = [];
  if (meal.photo_storage_keys && Array.isArray(meal.photo_storage_keys)) {
    keys.push(...(meal.photo_storage_keys as string[]));
  } else if (meal.photo_storage_key) {
    keys.push(meal.photo_storage_key);
  }

  if (keys.length > 0) {
    try {
      const { deleteObjects } = await import("@/lib/r2");
      await deleteObjects(keys);
    } catch (e) {
      console.warn("[DELETE meal] R2 cleanup failed:", e);
    }
  }

  return NextResponse.json({ ok: true });
}
