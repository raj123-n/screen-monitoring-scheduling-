'use server';

import { ai } from '@/ai/genkit';

export interface IngredientItem {
  name: string;
  quantity: number;
  unit: string;
}

export interface HealthyRecipeResult {
  title: string;
  servings: number;
  ingredients: IngredientItem[];
  steps: string[];
  nutritionTips: string[];
}

export async function getHealthyRecipe({
  dishName,
  servings = 2,
  location
}: {
  dishName: string;
  servings?: number;
  location?: string;
}): Promise<HealthyRecipeResult> {
  const prompt = buildPrompt({ dishName, servings, location });

  try {
    const { text } = await ai.generate(prompt);
    const json = safeJson(text);
    if (json && isHealthyRecipeResult(json)) {
      // Ensure servings alignment
      const scaled = json.servings !== servings ? { ...json, servings } : json;
      return scaled;
    }
    // Fallback to simple transformation if parsing failed
    return fallbackRecipe({ dishName, servings });
  } catch {
    return fallbackRecipe({ dishName, servings });
  }
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function scale(servings: number, base: IngredientItem[]): IngredientItem[] {
  const factor = servings / 2; // base list targets 2 servings
  return base.map(item => ({
    name: item.name,
    quantity: Math.round(item.quantity * factor * 100) / 100,
    unit: item.unit
  }));
}


function buildPrompt({ dishName, servings, location }: { dishName: string; servings: number; location?: string }) {
  const locHint = location ? `User location: ${location}. Prefer local/seasonal Indian ingredients and regional styles relevant to this location.` : `User location not provided. Prefer common Indian ingredients and widely available spices.`;
  return `You are a nutrition-focused chef. Generate a healthy, tasty recipe with an Indian cuisine focus.

Return ONLY strict JSON with this shape:
{
  "title": string,
  "servings": number,
  "ingredients": [{"name": string, "quantity": number, "unit": string}],
  "steps": string[],
  "nutritionTips": string[]
}

Constraints:
- Dish name: ${dishName} (adapt if needed to an Indian-style healthy version).
- Servings: ${servings}.
- ${locHint}
- Focus on home-cook friendly methods, minimal oil, low sodium, high vegetables, adequate protein.
- Use Indian units when natural (tsp, tbsp, cup, grams), and common Indian ingredients (e.g., dals, millets, paneer, spices like turmeric, cumin, coriander, mustard seeds, curry leaves).`;
}

function safeJson(text?: string | null): any | null {
  if (!text) return null;
  try {
    // Strip code fences if present
    const cleaned = text.replace(/^```(?:json)?/i, '').replace(/```$/,'').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

function isHealthyRecipeResult(x: any): x is HealthyRecipeResult {
  return x && typeof x.title === 'string' && typeof x.servings === 'number' && Array.isArray(x.ingredients) && Array.isArray(x.steps) && Array.isArray(x.nutritionTips);
}

function fallbackRecipe({ dishName, servings }: { dishName: string; servings: number }): HealthyRecipeResult {
  const normalized = dishName.trim().toLowerCase();
  if (normalized.includes('soup')) {
    return {
      title: `${capitalize(dishName)} (Light, High-veg)`,
      servings,
      ingredients: scale(servings, [
        { name: 'olive oil', quantity: 1, unit: 'tbsp' },
        { name: 'yellow onion, diced', quantity: 1, unit: 'small' },
        { name: 'garlic, minced', quantity: 2, unit: 'cloves' },
        { name: 'carrots, diced', quantity: 2, unit: 'medium' },
        { name: 'celery stalks, diced', quantity: 2, unit: 'stalks' },
        { name: 'low-sodium vegetable broth', quantity: 4, unit: 'cups' },
        { name: 'baby spinach', quantity: 2, unit: 'cups' },
        { name: 'cooked white beans (or lentils)', quantity: 1, unit: 'cup' },
        { name: 'fresh lemon juice', quantity: 1, unit: 'tbsp' },
        { name: 'salt & pepper', quantity: 0.5, unit: 'tsp each' }
      ]),
      steps: [
        'Heat olive oil in a pot over medium heat. Add onion and sauté 3–4 minutes until translucent.',
        'Add garlic, carrots, and celery. Cook 4–5 minutes, stirring occasionally.',
        'Pour in broth, bring to a boil, then reduce to a gentle simmer for 10–12 minutes until vegetables are tender.',
        'Stir in beans and spinach; simmer 2–3 minutes until spinach wilts.',
        'Finish with lemon juice, season with salt and pepper to taste. Serve warm.'
      ],
      nutritionTips: [
        'Use low-sodium broth to manage sodium intake.',
        'Add whole grains (cooked barley or quinoa) for fiber.',
        'Top with fresh herbs instead of extra salt.'
      ]
    };
  }
  if (normalized.includes('bowl') || normalized.includes('salad')) {
    return {
      title: `${capitalize(dishName)} (Balanced Macro Bowl)`,
      servings,
      ingredients: scale(servings, [
        { name: 'cooked quinoa', quantity: 1, unit: 'cup' },
        { name: 'cherry tomatoes, halved', quantity: 1, unit: 'cup' },
        { name: 'cucumber, diced', quantity: 1, unit: 'cup' },
        { name: 'mixed greens', quantity: 2, unit: 'cups' },
        { name: 'chickpeas, rinsed', quantity: 1, unit: 'cup' },
        { name: 'avocado, sliced', quantity: 0.5, unit: 'large' },
        { name: 'extra-virgin olive oil', quantity: 1, unit: 'tbsp' },
        { name: 'lemon juice', quantity: 1, unit: 'tbsp' },
        { name: 'dijon mustard', quantity: 0.5, unit: 'tsp' },
        { name: 'salt & pepper', quantity: 0.5, unit: 'tsp each' }
      ]),
      steps: [
        'Whisk olive oil, lemon juice, dijon, salt and pepper to make a light dressing.',
        'Arrange quinoa, greens, tomatoes, cucumber, chickpeas, and avocado in bowls.',
        'Drizzle dressing over the top and toss gently to combine.',
        'Optional: add grilled chicken or tofu for extra protein.'
      ],
      nutritionTips: [
        'Keep the dressing light to reduce calories.',
        'Include at least 3 colors of vegetables for diverse micronutrients.',
        'Swap quinoa for brown rice or farro as desired.'
      ]
    };
  }
  return {
    title: `${capitalize(dishName)} (Healthy Version)`,
    servings,
    ingredients: scale(servings, [
      { name: 'extra-virgin olive oil', quantity: 1, unit: 'tbsp' },
      { name: 'lean protein (chicken breast or firm tofu)', quantity: 8, unit: 'oz' },
      { name: 'assorted vegetables (bell pepper, broccoli, carrots)', quantity: 3, unit: 'cups' },
      { name: 'whole grain (cooked brown rice or quinoa)', quantity: 2, unit: 'cups' },
      { name: 'low-sodium soy sauce or tamari', quantity: 1.5, unit: 'tbsp' },
      { name: 'fresh garlic, minced', quantity: 2, unit: 'cloves' },
      { name: 'fresh ginger, grated', quantity: 1, unit: 'tsp' },
      { name: 'sesame seeds (optional)', quantity: 1, unit: 'tsp' }
    ]),
    steps: [
      'Heat oil in a large skillet over medium-high heat. Add protein and cook until browned and cooked through. Remove and set aside.',
      'Add vegetables to the skillet; stir-fry 4–6 minutes until crisp-tender.',
      'Return protein to the pan with garlic, ginger, and soy/tamari. Toss 1–2 minutes to coat.',
      'Serve over warm whole grains. Garnish with sesame seeds if using.'
    ],
    nutritionTips: [
      'Aim for half the plate vegetables, quarter protein, quarter whole grains.',
      'Limit added sodium; use citrus and herbs for flavor.',
      'Batch cook grains to save time in future meals.'
    ]
  };
}

