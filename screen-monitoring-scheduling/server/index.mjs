import http from 'node:http'
import { genkit } from 'genkit'
import { googleAI } from '@genkit-ai/googleai'

const PORT = parseInt(process.env.RECIPE_API_PORT || '8787')

const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
})

function buildPrompt({ dishName, servings, location }) {
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

function safeJson(text) {
  if (!text) return null
  try {
    const cleaned = String(text).replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}

function json(res, status, body) {
  const data = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'OPTIONS, POST',
  })
  res.end(data)
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'OPTIONS, POST',
    })
    res.end()
    return
  }

  if ((req.method === 'POST' || req.method === 'GET') && req.url && req.url.startsWith('/api/healthy-recipe')) {
    try {
      let dishName, servings = 2, location
      if (req.method === 'GET') {
        const u = new URL(req.url, `http://localhost:${PORT}`)
        dishName = u.searchParams.get('dishName') || undefined
        location = u.searchParams.get('location') || undefined
        const s = u.searchParams.get('servings')
        if (s) servings = Number(s) || 2
      } else {
        const chunks = []
        for await (const chunk of req) chunks.push(chunk)
        const body = JSON.parse(Buffer.concat(chunks).toString() || '{}')
        dishName = body?.dishName
        servings = body?.servings ?? 2
        location = body?.location
      }
      if (!dishName || typeof dishName !== 'string') {
        json(res, 400, { error: 'dishName is required', hint: 'Provide dishName in JSON (POST) or as query param (GET)' })
        return
      }

      const prompt = buildPrompt({ dishName, servings, location })
      const { text } = await ai.generate(prompt)
      const data = safeJson(text)
      if (!data || !data.title || !Array.isArray(data.ingredients) || !Array.isArray(data.steps)) {
        json(res, 502, { error: 'Invalid AI response' })
        return
      }
      // Normalize servings from client
      data.servings = servings
      json(res, 200, data)
    } catch (e) {
      json(res, 500, { error: 'Server error', details: e?.message || String(e) })
    }
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not found' }))
})

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[healthy-recipe] server listening on http://localhost:${PORT}`)
})
