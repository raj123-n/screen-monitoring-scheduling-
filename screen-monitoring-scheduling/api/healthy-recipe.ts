// Allow GEMINI_API_KEY; Genkit expects GOOGLE_GENAI_API_KEY.
if (!process.env.GOOGLE_GENAI_API_KEY && process.env.GEMINI_API_KEY) {
  process.env.GOOGLE_GENAI_API_KEY = process.env.GEMINI_API_KEY
}
import { genkit } from 'genkit'
import { googleAI } from '@genkit-ai/googleai'

const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
})

function buildPrompt({ dishName, servings, location }: { dishName: string; servings: number; location?: string }) {
  const locHint = location
    ? `User location: ${location}. Prefer local/seasonal Indian ingredients and regional styles relevant to this location.`
    : `User location not provided. Prefer common Indian ingredients and widely available spices.`
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
- Use Indian units when natural (tsp, tbsp, cup, grams), and common Indian ingredients (e.g., dals, millets, paneer, spices like turmeric, cumin, coriander, mustard seeds, curry leaves).`
}

function safeJson(text?: string | null): any | null {
  if (!text) return null
  try {
    const cleaned = String(text).replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}

export default async function handler(req: any, res: any) {
  // CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  try {
    let dishName: string | undefined
    let servings: number = 2
    let location: string | undefined

    if (req.method === 'GET') {
      const url = new URL(req.url || '', 'https://dummy.local')
      dishName = url.searchParams.get('dishName') || undefined
      location = url.searchParams.get('location') || undefined
      const s = url.searchParams.get('servings')
      if (s) servings = Number(s) || 2
    } else if (req.method === 'POST') {
      const body = (req.body || {}) as { dishName?: string; servings?: number; location?: string }
      dishName = body.dishName
      servings = body.servings ?? 2
      location = body.location
    } else {
      res.status(405).json({ error: 'Method not allowed' })
      return
    }

    if (!dishName || typeof dishName !== 'string') {
      res.status(400).json({ error: 'dishName is required', hint: 'Provide dishName in JSON (POST) or as query param (GET)' })
      return
    }

    const prompt = buildPrompt({ dishName, servings, location })
    const { text } = await ai.generate(prompt)
    const data = safeJson(text)
    if (!data || !data.title || !Array.isArray(data.ingredients) || !Array.isArray(data.steps)) {
      res.status(502).json({ error: 'Invalid AI response' })
      return
    }

    data.servings = servings
    res.status(200).json(data)
  } catch (e: any) {
    res.status(500).json({ error: 'Server error', details: e?.message || String(e) })
  }
}
