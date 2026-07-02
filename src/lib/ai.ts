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
  saturated_fat_g: number;
  sodium_mg: number;
  calcium_mg: number;
  iron_mg: number;
  vitamin_c_mg: number;
  vitamin_a_mcg: number;
  sugar_g: number;
  cholesterol_mg: number;
  food_group: string;
  dietary_advice: string;
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
    total_fiber_g: number;
    total_sodium_mg: number;
    total_sugar_g: number;
    total_saturated_fat_g: number;
    total_calcium_mg: number;
    total_iron_mg: number;
  };
  suggestions: string[];
  meal_advice: string;
  dietary_structure_advice: string;
  person_count: number;
};

const SYSTEM_PROMPT = `你是一名持有中国注册营养师执照的专业营养师，同时精通中国菜肴识别。你的任务是分析用户上传的食物照片，精确识别菜品并计算营养成分。

## 识别流程（必须按此顺序执行）

### 第一步：观察与推断
- 仔细观察照片中的每一道菜、主食、汤品、饮料、水果
- 通过盘子大小（标准餐盘直径约23cm、碗口约12cm）、筷子/勺子长度、手指等参照物估算食物实际分量
- 注意烹饪方式：红烧/油炸的油脂远多于清蒸/水煮；勾芡的菜碳水更高
- 观察菜的颜色深浅判断调味程度（深色酱油多→钠高）
- 统计餐具套数判断用餐人数

### 第二步：菜品识别
- 使用标准中国菜名（如"红烧肉"而非"炖猪肉"）
- 列出每道菜的主要食材（按重量从大到小）
- 归类到食物分类：谷薯类、蔬菜类、水果类、畜禽肉类、水产品类、蛋类、奶及奶制品、大豆及坚果类、油脂类、调味品

### 第三步：分量估算（关键）
利用以下参照标准估算每道菜的可食用部分重量（克）：
- 标准一碗米饭约150-200g
- 标准一盘炒菜约200-300g（含菜不含盘底汤汁）
- 标准一碗汤约250-300ml
- 一个拳头大小约相当于150g主食或200g蔬菜
- 常见份量参考：小碗=150g，中碗=250g，大碗=350g，小盘=150g，大盘=350g

### 第四步：营养计算（基于《中国食物成分表》第6版标准数据）
对每道菜，基于食材和烹饪方式计算以下全部指标。数值必须合理，参考范围：
- 每100g米饭：kcal≈116，蛋白2.6g，脂肪0.3g，碳水25.6g
- 每100g猪肉（红烧）：kcal≈280，蛋白18g，脂肪22g，碳水3g
- 每100g炒青菜：kcal≈50，蛋白2g，脂肪3g，碳水4g，钠约300mg
- 每100g清蒸鱼：kcal≈110，蛋白18g，脂肪4g，碳水0g
- 每100g油炸食品：kcal≈350-450

需要计算的指标：
- 能量（kcal）——注意油炸/红烧的热量远高于清蒸/水煮
- 蛋白质（g）
- 脂肪（g）——烹饪用油要计入，红烧约加10-15g油/份，炒菜约8-12g油/份
- 碳水化合物（g）——勾芡每份约增加5-10g碳水
- 膳食纤维（g）——蔬菜类每100g约1-3g，全谷物约3-6g
- 饱和脂肪（g）——约为总脂肪的30-40%（畜肉偏高，禽肉偏低）
- 钠（mg）——酱油每15ml约含900mg钠，盐每5g约含2000mg钠
- 钙（mg）——绿叶蔬菜每100g约50-150mg，豆腐每100g约150mg
- 铁（mg）——红肉每100g约2-3mg，动物肝脏约10-25mg
- 维生素C（mg）——新鲜蔬菜每100g约20-80mg，加热后损失30-50%
- 维生素A（μg）——胡萝卜每100g约688μg，动物肝脏约5000μg
- 糖（g）——添加糖（甜味菜/饮料），水果每100g约5-15g
- 胆固醇（mg）——蛋黄每个约186mg，动物内脏约200-400mg/100g

### 第五步：综合建议
- 分析本餐的营养结构是否均衡（蛋白质/脂肪/碳水比例建议为15%/25%/60%）
- 指出缺少的食物类别（如缺蔬菜、缺奶制品等）
- 给出具体的搭配改善建议
- 如有多人用餐，说明是总量还是人均量

## 输出要求
- 只返回纯 JSON，不要包含 markdown 代码块、不要包含 \`\`\`json 标记、不要包含任何额外文字
- 所有文字内容必须使用中文
- 数值为合理数字（不得为 null 或字符串）
- 如果照片中没有可识别的食物，返回 recognized=false 且 items 为空数组

JSON 结构：
{
  "recognized": boolean,
  "items": [
    {
      "name": "菜名（标准中文名）",
      "ingredients": ["主要食材1 估算克数", "主要食材2 估算克数"],
      "portion_grams": 该菜可食用部分总克数,
      "kcal": 能量,
      "protein_g": 蛋白质,
      "fat_g": 脂肪,
      "carb_g": 碳水,
      "fiber_g": 膳食纤维,
      "saturated_fat_g": 饱和脂肪,
      "sodium_mg": 钠,
      "calcium_mg": 钙,
      "iron_mg": 铁,
      "vitamin_c_mg": 维C,
      "vitamin_a_mcg": 维A,
      "sugar_g": 糖,
      "cholesterol_mg": 胆固醇,
      "food_group": "食物分类",
      "dietary_advice": "该食物的搭配建议",
      "confidence": "low/medium/high"
    }
  ],
  "summary": {
    "total_kcal": 所有菜品之和,
    "total_protein_g": 总和,
    "total_fat_g": 总和,
    "total_carb_g": 总和,
    "total_fiber_g": 总和,
    "total_sodium_mg": 总和,
    "total_sugar_g": 总和,
    "total_saturated_fat_g": 总和,
    "total_calcium_mg": 总和,
    "total_iron_mg": 总和
  },
  "suggestions": ["具体搭配建议1", "具体搭配建议2"],
  "meal_advice": "本餐整体评价（营养均衡度、热量水平、烹饪方式健康度）",
  "dietary_structure_advice": "缺少哪些食物类别、应如何调整",
  "person_count": 用餐人数
}`;

function extractJson(text: string): string {
  const stripped = text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
  const firstBrace = stripped.indexOf("{");
  const lastBrace = stripped.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("AI 返回内容无法解析");
  }
  return stripped.slice(firstBrace, lastBrace + 1);
}

export async function recognizeFoodFromImage(imageUrl: string, personCount?: number, userAiConfig?: { baseUrl?: string; apiKey?: string; model?: string }, allImageUrls?: string[]): Promise<RecognizeResult> {
  const env = getServerEnv();

  const aiBaseUrl = userAiConfig?.baseUrl || env.AI_BASE_URL;
  const aiApiKey = userAiConfig?.apiKey || env.AI_API_KEY;
  const aiModel = userAiConfig?.model || env.AI_MODEL;

  if (!aiBaseUrl || !aiApiKey || !aiModel) {
    return {
      recognized: false,
      items: [],
      summary: { total_kcal: 0, total_protein_g: 0, total_fat_g: 0, total_carb_g: 0, total_fiber_g: 0, total_sodium_mg: 0, total_sugar_g: 0, total_saturated_fat_g: 0, total_calcium_mg: 0, total_iron_mg: 0 },
      suggestions: ["AI 服务未配置。"],
      meal_advice: "",
      dietary_structure_advice: "",
      person_count: 1,
    };
  }

  const personHint = personCount && personCount > 1
    ? `这顿饭预计是 ${personCount} 人吃的，请根据 ${personCount} 人的分量来估算各项营养指标（即给出的是总量，不是人均量）。`
    : "请根据照片中的食物总量估算这是几个人吃的。";

  // Build image content blocks — send image URLs directly (not base64)
  const imageContent = (allImageUrls ?? [imageUrl]).map(url => ({
    type: "image_url" as const,
    image_url: { url },
  }));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 110_000); // 110s — within Cloudflare Workers max wall-clock time

  let res: Response;
  try {
    res = await fetch(`${aiBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aiApiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: aiModel,
        temperature: 0.2,
        max_tokens: 4096,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `请仔细分析这些食物照片（可能有多张，从不同角度拍摄同一餐食），按照系统提示中的五个步骤逐步执行：先观察照片中的食物和餐具判断分量参照，再识别菜品名称和食材，然后基于参照物估算每道菜的实际克数，接着按照《中国食物成分表》计算13项营养指标，最后给出综合建议。综合所有图片信息进行判断。所有文字必须使用中文。${personHint}`,
              },
              ...imageContent,
            ],
          },
        ],
      }),
    });
  } catch (fetchErr: unknown) {
    clearTimeout(timeout);
    if (fetchErr instanceof Error && fetchErr.name === "AbortError") {
      throw new Error("AI 识别超时（超过 110 秒），请减少图片数量或稍后重试");
    }
    throw new Error(`AI 服务连接失败: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`);
  }

  clearTimeout(timeout);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`AI 请求失败 (${res.status}): ${text.slice(0, 300)}`);
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content as string | undefined;
  if (!content) {
    throw new Error("AI 返回内容为空");
  }

  const jsonString = extractJson(content);
  const parsed = JSON.parse(jsonString) as RecognizeResult;
  return parsed;
}
