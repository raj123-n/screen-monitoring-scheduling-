'use server';

import {ai} from '@/ai/genkit';


export interface WeatherFoodSuggestionsResult {
  foodSuggestions: string;
}

export async function weatherBasedFoodSuggestions({ 
  location, 
  weatherDescription 
}: { 
  location: string; 
  weatherDescription: string; 
}): Promise<WeatherFoodSuggestionsResult> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));

  const weather = weatherDescription.toLowerCase();
  const loc = location.toLowerCase();
  
  let foodSuggestions = "";

  // Hot weather suggestions
  if (weather.includes("hot") || weather.includes("sunny") || weather.includes("warm") || 
      weather.includes("heat") || weather.includes("scorching")) {
    foodSuggestions = `Perfect weather for refreshing, hydrating foods in ${location}!\n\n🥤 **Hydration Focus:**\n• Coconut water or infused water with cucumber, mint, or citrus\n• Fresh fruit smoothies with berries and banana\n• Herbal iced teas (green tea, chamomile)\n\n🥗 **Light & Fresh:**\n• Greek salad with tomatoes, cucumbers, and feta\n• Gazpacho or cold soups\n• Fresh fruit salad with watermelon, cantaloupe, and berries\n• Sushi or poke bowls with fresh fish\n\n🥤 **Cooling Foods:**\n• Yogurt parfaits with granola\n• Frozen grapes or banana "nice cream"\n• Cucumber and mint salad\n• Light pasta salads with vegetables\n\n💡 **Tips:**\n• Avoid heavy, greasy foods that can make you feel sluggish in the heat\n• Eat smaller, more frequent meals\n• Focus on foods with high water content\n• Consider lighter cooking methods like grilling or steaming`;
  }
  // Cold weather suggestions
  else if (weather.includes("cold") || weather.includes("chilly") || weather.includes("freezing") || 
           weather.includes("snow") || weather.includes("winter") || weather.includes("frost")) {
    foodSuggestions = `Cozy comfort foods are perfect for this cold weather in ${location}!\n\n🍲 **Warming Soups & Stews:**\n• Hearty vegetable soup with root vegetables\n• Chicken noodle soup or bone broth\n• Lentil or bean stew with warming spices\n• Miso soup with tofu and seaweed\n\n🔥 **Comfort Foods:**\n• Oatmeal with nuts, seeds, and warm spices\n• Roasted vegetables (sweet potato, carrots, Brussels sprouts)\n• Quinoa or brown rice bowls with roasted vegetables\n• Baked apples with cinnamon and nuts\n\n☕ **Warming Beverages:**\n• Herbal teas (ginger, chamomile, peppermint)\n• Golden milk with turmeric and ginger\n• Hot chocolate with dark cocoa\n• Warm lemon water with honey\n\n💡 **Tips:**\n• Include warming spices like ginger, cinnamon, and turmeric\n• Focus on root vegetables and hearty grains\n• Consider slow-cooked meals for maximum comfort\n• Don't forget to stay hydrated even in cold weather`;
  }
  // Rainy weather suggestions
  else if (weather.includes("rain") || weather.includes("rainy") || weather.includes("drizzle") || 
           weather.includes("storm") || weather.includes("cloudy") || weather.includes("overcast")) {
    foodSuggestions = `Rainy day comfort foods will brighten your mood in ${location}!\n\n🍜 **Comfort Classics:**\n• Mac and cheese with vegetables\n• Grilled cheese with tomato soup\n• Pasta with marinara sauce and vegetables\n• Risotto with mushrooms and herbs\n\n☕ **Cozy Beverages:**\n• Hot tea or coffee with your favorite milk\n• Hot chocolate with marshmallows\n• Warm apple cider with spices\n• Golden milk latte\n\n🍪 **Indulgent Treats:**\n• Fresh baked cookies or muffins\n• Banana bread or zucchini bread\n• Rice pudding or bread pudding\n• Dark chocolate with nuts\n\n💡 **Tips:**\n• Focus on foods that bring comfort and warmth\n• Include mood-boosting foods like dark chocolate\n• Consider making a big pot of soup to last the day\n• Don't forget your vegetables - add them to comfort foods`;
  }
  // Mild/pleasant weather suggestions
  else {
    foodSuggestions = `Lovely weather in ${location}! Perfect for balanced, nutritious meals.\n\n🥗 **Fresh & Balanced:**\n• Buddha bowls with grains, vegetables, and protein\n• Fresh salads with seasonal ingredients\n• Grilled fish or chicken with roasted vegetables\n• Quinoa or brown rice with stir-fried vegetables\n\n🍎 **Seasonal Focus:**\n• Fresh fruit with yogurt and granola\n• Vegetable stir-fries with lean protein\n• Whole grain wraps with hummus and vegetables\n• Smoothie bowls with fresh toppings\n\n🥤 **Hydration:**\n• Infused water with fruits and herbs\n• Green tea or herbal teas\n• Fresh fruit juices (in moderation)\n• Sparkling water with citrus\n\n💡 **Tips:**\n• Take advantage of the pleasant weather for outdoor dining\n• Focus on seasonal, local ingredients\n• Balance your macronutrients\n• Stay hydrated and enjoy the fresh air`;
  }

  return {
    foodSuggestions
  };
}
