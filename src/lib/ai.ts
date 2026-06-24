import { getServerEnv } from "./env";

type RecognizedItem = {
  name: string;
  ingredients: string[];
  portion_grams: number;
  kcal: number;
  protein_g: number;
  fat_g: number;
  carb_g: number;
  fiber_g: number;
  confidence: "low" | "medium" | "high";
};

export type RecognizeResult = {
  recognized: boolean;
  items: RecognizedItem[];
  summary: {
    total_kcal: number;
    total_protein_g: number;
    total_fat_g: number;
    total_carb_g: number;
  };
  suggestions: string[];
};

const SYSTEM_PROMPT = `You are a strict nutrition recognition API.
Return ONLY valid JSON matching the required schema.
For one or more dishes in the photo:
- estimate ingredients
- estimate portion in grams
- estimate kcal, protein, fat, carb, fiber
- return confidence low/medium/high
- if nothing recognizable, set recognized=false with empty items.
JSON schema:
{
  "recognized": boolean,
  "items": [
    {
      "name": string,
      "ingredients": string[],
      "portion_grams": number,
      "kcal": number,
      "protein_g": number,
      "fat_g": number,
      "carb_g": number,
      "fiber_g": number,
      "confidence": "low" | "medium" | "high"
    }
  ],
  "summary": {
    "total_kcal": number,
    "total_protein_g": number,
    "total_fat_g": number,
    "total_carb_g": number
  },
  "suggestions": string[]
}`;

export async function recognizeFoodFromImage(imageUrl: string): Promise<RecognizeResult> {
  const env = getServerEnv();

  if (!env.AI_BASE_URL || !env.AI_API_KEY || !env.AI_MODEL) {
    return {
      recognized: false,
      items: [],
      summary: { total_kcal: 0, total_protein_g: 0, total_fat_g: 0, total_carb_g: 0 },
      suggestions: ["AI provider is not configured."],
    };
  }

  const res = await fetch(`${env.AI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.AI_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this food photo and return the structured JSON result now.",
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI request failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content as string | undefined;
  if (!content) {
    throw new Error("AI returned empty content");
  }

  const match = content.match(/[\s\S]*\{[\s\S]*\}/);
  if (!match) {
    throw new Error("AI returned unparseable content");
  }

  const parsed = JSON.parse(match[0]) as RecognizeResult;
  return parsed;
}
