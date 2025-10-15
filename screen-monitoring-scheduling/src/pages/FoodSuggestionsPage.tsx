"use client";

import { useState } from "react";
import { weatherBasedFoodSuggestions } from "@/ai/flows/weather-based-food-suggestions";
import { getHealthyRecipe, HealthyRecipeResult } from "@/ai/flows/healthy-recipe";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CloudSun, Lightbulb } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function FoodSuggestionsPage() {
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recipeDish, setRecipeDish] = useState("");
  const [recipeServings, setRecipeServings] = useState(2);
  const [recipe, setRecipe] = useState<HealthyRecipeResult | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuggestions("");
    try {
      const result = await weatherBasedFoodSuggestions({
        location,
        weatherDescription: weather,
      });
      setSuggestions(result.foodSuggestions);
    } catch (err) {
      setError("Could not fetch suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setRecipe(null);
    try {
      const result = await getHealthyRecipe({ dishName: recipeDish, servings: recipeServings });
      setRecipe(result);
    } catch (err) {
      setError("Could not fetch recipe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start h-full">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold font-headline">Weather-Based Food Suggestions</h1>
          <p className="text-muted-foreground mt-2">
            Get personalized healthy food ideas based on your local weather.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <CloudSun /> Your Local Weather
              </CardTitle>
              <CardDescription>
                Enter your location and the current weather to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location (e.g., "Paris, France")</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter your city and country"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weather">Weather Description (e.g., "Sunny and warm")</Label>
                <Input
                  id="weather"
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  placeholder="Describe the weather"
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Suggestions
              </Button>
            </CardFooter>
          </form>
        </Card>

        {error && (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {suggestions && (
          <Alert>
             <Lightbulb className="h-4 w-4" />
            <AlertTitle className="font-headline">Your Food Suggestions</AlertTitle>
            <AlertDescription className="whitespace-pre-wrap pt-2">
              <div
                dangerouslySetInnerHTML={{
                  __html: suggestions
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1<\/strong>')
                    .replace(/\n/g, '<br/>')
                }}
              />
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <form onSubmit={handleGetRecipe}>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                Healthy Recipe Builder
              </CardTitle>
              <CardDescription>
                Enter a dish and get a healthy recipe with ingredients and steps.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dish">Dish Name</Label>
                <Input
                  id="dish"
                  value={recipeDish}
                  onChange={(e) => setRecipeDish(e.target.value)}
                  placeholder="e.g., Tomato Soup, Quinoa Bowl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  min={1}
                  max={8}
                  value={recipeServings}
                  onChange={(e) => setRecipeServings(Number(e.target.value))}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Healthy Recipe
              </Button>
            </CardFooter>
          </form>
        </Card>

        {recipe && (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">{recipe.title}</CardTitle>
              <CardDescription>Servings: {recipe.servings}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Ingredients</h3>
                <ul className="list-disc pl-6 space-y-1">
                  {recipe.ingredients.map((it, idx) => (
                    <li key={idx}>
                      {it.quantity} {it.unit} {it.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Steps</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  {recipe.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
              {recipe.nutritionTips?.length ? (
                <div>
                  <h3 className="font-semibold mb-2">Healthy Tips</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {recipe.nutritionTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
