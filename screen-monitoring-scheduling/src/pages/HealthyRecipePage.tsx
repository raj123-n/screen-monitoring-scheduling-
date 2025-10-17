"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ChefHat, MapPin, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type IngredientItem = {
  name: string;
  quantity: number;
  unit: string;
};

type HealthyRecipeResult = {
  title: string;
  servings: number;
  ingredients: IngredientItem[];
  steps: string[];
  nutritionTips: string[];
};

export default function HealthyRecipePage() {
  const [dishName, setDishName] = useState("");
  const [servings, setServings] = useState(2);
  const [location, setLocation] = useState("");
  const [recipe, setRecipe] = useState<HealthyRecipeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGetRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setRecipe(null);

    try {
      const q = new URLSearchParams({
        dishName: dishName.trim(),
        servings: String(servings),
        location: location.trim() || ""
      }).toString();

      const res = await fetch(`/api/healthy-recipe?${q}`, { method: "GET" });
      
      if (!res.ok) {
        let serverMsg = "";
        try {
          const maybeJson = await res.json();
          serverMsg = (maybeJson?.error || maybeJson?.message || JSON.stringify(maybeJson));
        } catch {
          try { serverMsg = await res.text(); } catch {}
        }
        console.error("/api/healthy-recipe failed", res.status, serverMsg);
        throw new Error(serverMsg || `HTTP ${res.status}`);
      }

      const data: HealthyRecipeResult = await res.json();
      setRecipe(data);
    } catch (err: any) {
      const msg = typeof err?.message === 'string' && err.message.trim().length
        ? err.message
        : 'Could not fetch recipe. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <ChefHat className="h-12 w-12 text-orange-600" />
            <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
              Healthy Recipe Builder
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get personalized, healthy Indian recipes powered by AI. Enter your dish, location, and servings to receive authentic recipes with nutritional tips.
          </p>
        </div>

        {/* Input Form */}
        <Card className="shadow-lg border-2">
          <form onSubmit={handleGetRecipe}>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Recipe Details
              </CardTitle>
              <CardDescription>
                Tell us what you'd like to cook and we'll create a healthy Indian-style recipe for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="dish" className="flex items-center gap-2">
                  <ChefHat className="h-4 w-4" />
                  Dish Name *
                </Label>
                <Input
                  id="dish"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="e.g., Masala Dosa, Khichdi, Paneer Tikka"
                  required
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Your Location (Optional)
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Mumbai, Bengaluru, Delhi"
                  className="text-lg"
                />
                <p className="text-sm text-muted-foreground">
                  We'll suggest local, seasonal ingredients based on your region.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="servings" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Servings
                </Label>
                <Input
                  id="servings"
                  type="number"
                  min={1}
                  max={12}
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className="text-lg"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                disabled={isLoading || !dishName.trim()} 
                className="w-full text-lg h-12 bg-gradient-to-r from-orange-600 to-green-600 hover:from-orange-700 hover:to-green-700"
              >
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {isLoading ? "Generating Recipe..." : "Get Healthy Recipe"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="border-2">
            <AlertTitle className="font-semibold">Error</AlertTitle>
            <AlertDescription className="text-base">{error}</AlertDescription>
          </Alert>
        )}

        {/* Recipe Display */}
        {recipe && (
          <Card className="shadow-xl border-2 border-green-200">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-green-50">
              <CardTitle className="font-headline text-2xl text-orange-700">
                {recipe.title}
              </CardTitle>
              <CardDescription className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Servings: {recipe.servings}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              {/* Ingredients */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-orange-600 flex items-center gap-2 border-b-2 border-orange-200 pb-2">
                  🥘 Ingredients
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {recipe.ingredients.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 p-2 rounded hover:bg-orange-50 transition-colors">
                      <span className="text-orange-600 font-bold">•</span>
                      <span className="text-base">
                        <span className="font-semibold">{item.quantity} {item.unit}</span> {item.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-green-600 flex items-center gap-2 border-b-2 border-green-200 pb-2">
                  👨‍🍳 Cooking Steps
                </h3>
                <ol className="space-y-3">
                  {recipe.steps.map((step, idx) => (
                    <li key={idx} className="flex gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-base pt-1">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Nutrition Tips */}
              {recipe.nutritionTips?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-blue-600 flex items-center gap-2 border-b-2 border-blue-200 pb-2">
                    💡 Healthy Tips
                  </h3>
                  <ul className="space-y-2">
                    {recipe.nutritionTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                        <span className="text-blue-600 text-xl">✓</span>
                        <span className="text-base pt-0.5">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Powered by Google Gemini AI • Focused on Indian Cuisine & Healthy Cooking</p>
        </div>
      </div>
    </div>
  );
}
