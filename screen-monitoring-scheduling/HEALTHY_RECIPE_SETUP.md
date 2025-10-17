# Healthy Recipe Builder - Setup Guide

## Overview

A standalone Healthy Recipe page powered by Google Gemini AI that generates Indian-focused, location-aware healthy recipes.

## Features

- **AI-Powered Recipe Generation**: Uses Gemini 2.5 Flash model
- **Indian Cuisine Focus**: Specializes in authentic Indian recipes with local ingredients
- **Location-Aware**: Suggests seasonal/regional ingredients based on user location
- **Customizable Servings**: Generate recipes for 1-12 servings
- **Nutritional Tips**: Includes healthy cooking tips and modifications
- **Beautiful UI**: Modern, responsive design with gradient accents

## Architecture

### Frontend
- **Page**: `src/pages/HealthyRecipePage.tsx`
- **Route**: `/healthy-recipe` (protected, requires authentication)
- **Method**: GET request to `/api/healthy-recipe` with query params

### Backend
- **Vercel Function**: `api/healthy-recipe.js` (ESM JavaScript)
- **Local Dev Server**: `server/index.mjs` (for development)
- **Model**: `googleai/gemini-2.5-flash`
- **Supports**: GET and POST methods

## Environment Variables

Set one of these in your environment:

```bash
# Option 1 (recommended for Vercel)
GEMINI_API_KEY=your_gemini_api_key_here

# Option 2 (Genkit default)
GOOGLE_GENAI_API_KEY=your_gemini_api_key_here
```

Both are automatically mapped in the backend code.

## Local Development

### 1. Set API Key
```powershell
# PowerShell
$env:GEMINI_API_KEY = "YOUR_REAL_KEY"
```

### 2. Start API Server (Terminal 1)
```bash
npm run recipe:dev
```
Server listens on `http://localhost:8787`

### 3. Start Vite Dev Server (Terminal 2)
```bash
npm run dev
```
App runs on `http://localhost:8080`

### 4. Test API Directly
```
http://localhost:8787/api/healthy-recipe?dishName=Khichdi&servings=2&location=Mumbai
```

### 5. Access UI
Navigate to: `http://localhost:8080/healthy-recipe`

## Vercel Deployment

### 1. Push to GitHub
```bash
git add -A
git commit -m "feat: add Healthy Recipe Builder with Gemini AI"
git push origin main
```

### 2. Configure Vercel
- Connect your GitHub repo to Vercel
- Go to Project Settings → Environment Variables
- Add:
  - **Key**: `GEMINI_API_KEY`
  - **Value**: Your Gemini API key
  - **Environments**: Production, Preview

### 3. Deploy
- Push triggers auto-deploy
- Or click "Redeploy" in Vercel dashboard

### 4. Verify Production
Test the API:
```
https://your-app.vercel.app/api/healthy-recipe?dishName=Masala%20Dosa&servings=2&location=Bengaluru
```

Access the page:
```
https://your-app.vercel.app/healthy-recipe
```

## API Reference

### Endpoint
`GET /api/healthy-recipe`

### Query Parameters
- `dishName` (required): Name of the dish (e.g., "Masala Dosa")
- `servings` (optional): Number of servings (default: 2, range: 1-12)
- `location` (optional): User location for regional ingredients (e.g., "Mumbai, India")

### Response Format
```json
{
  "title": "Healthy Masala Dosa",
  "servings": 2,
  "ingredients": [
    {
      "name": "rice",
      "quantity": 1,
      "unit": "cup"
    }
  ],
  "steps": [
    "Soak rice and urad dal for 4-6 hours...",
    "Grind to a smooth batter..."
  ],
  "nutritionTips": [
    "Use minimal oil for healthier dosas",
    "Add vegetables to the filling for extra nutrition"
  ]
}
```

### Error Responses
- `400`: Missing or invalid `dishName`
- `405`: Method not allowed (only GET/POST supported)
- `500`: Server error (check API key, rate limits)
- `502`: Invalid AI response (model returned non-JSON)

## Files Structure

```
screen-monitoring-scheduling/
├── api/
│   ├── healthy-recipe.js          # Vercel serverless function
│   └── healthy-recipe.ts          # (optional, can delete)
├── server/
│   └── index.mjs                  # Local dev API server
├── src/
│   ├── pages/
│   │   └── HealthyRecipePage.tsx  # Main UI component
│   └── App.tsx                    # Route configuration
└── vercel.json                    # Vercel config (minimal)
```

## Troubleshooting

### "404 NOT_FOUND" on Vercel
- Ensure `api/healthy-recipe.js` exists (not just `.ts`)
- Check Vercel build logs for compilation errors
- Verify `vercel.json` doesn't have custom routes blocking `/api/*`

### "Unexpected token '<', "<!DOCTYPE "..." error
- The API route is serving HTML instead of JSON
- Check that `vercel.json` has no catch-all route before API routes
- Ensure function is deployed (check Vercel Functions tab)

### "ECONNREFUSED" during local dev
- Start the API server first: `npm run recipe:dev`
- Ensure it's listening on port 8787
- Check that `vite.config.ts` has the proxy configured

### "Invalid AI response" (502)
- Model returned non-JSON text
- Check Vercel function logs for raw response
- May need to adjust prompt or add retry logic

### Rate Limits / 429 Errors
- Gemini API has rate limits
- Add exponential backoff retry logic if needed
- Check your Google AI Studio quota

## Customization

### Change Model
Edit `api/healthy-recipe.js` and `server/index.mjs`:
```javascript
const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-pro',  // or other model
})
```

### Adjust Prompt
Modify `buildPrompt()` function in both backend files to:
- Change cuisine focus (e.g., Mediterranean, Asian)
- Add dietary restrictions (vegan, gluten-free)
- Adjust tone or detail level

### Add Caching
For production, consider caching responses:
- Use Vercel KV or Redis
- Cache by `dishName + servings + location` key
- Set TTL (e.g., 7 days)

## Security Notes

- **Never commit API keys** to git
- Add `.env` to `.gitignore`
- Use Vercel environment variables for production
- API keys are only used server-side (safe)
- CORS is enabled for frontend access

## Performance

- **Cold Start**: ~1-3 seconds on Vercel (first request)
- **Warm Response**: ~500ms-2s (depends on Gemini API)
- **Caching**: Not implemented (add if needed)

## Support

For issues:
1. Check Vercel deployment logs
2. Test API endpoint directly in browser
3. Check browser console for client errors
4. Verify environment variables are set correctly

---

**Created**: October 2025  
**Model**: Google Gemini 2.5 Flash  
**Framework**: React + Vite + Vercel Serverless Functions
