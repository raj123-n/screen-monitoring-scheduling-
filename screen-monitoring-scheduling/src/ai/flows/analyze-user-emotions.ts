'use server';

import {ai} from '@/ai/genkit';

export interface EmotionAnalysisResult {
  emotion: string;
  suggestions: string;
}

export async function analyzeUserEmotions({ userInput }: { userInput: string }): Promise<EmotionAnalysisResult> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  // Simple emotion analysis based on keywords
  const input = userInput.toLowerCase();
  
  let emotion = "neutral";
  let suggestions = "";

  // Analyze for stress/anxiety indicators
  if (input.includes("stressed") || input.includes("anxious") || input.includes("worried") || 
      input.includes("overwhelmed") || input.includes("pressure") || input.includes("deadline")) {
    emotion = "stressed";
    suggestions = "I understand you're feeling stressed. Here are some suggestions:\n\n• Take a 5-minute breathing break\n• Try the 20-20-20 rule for your eyes\n• Consider a short walk or stretch\n• Break your tasks into smaller, manageable chunks\n• Practice deep breathing exercises";
  }
  // Analyze for sadness indicators
  else if (input.includes("sad") || input.includes("down") || input.includes("depressed") || 
           input.includes("lonely") || input.includes("empty") || input.includes("hopeless")) {
    emotion = "sad";
    suggestions = "I'm sorry you're feeling down. Here are some gentle suggestions:\n\n• Take a moment to acknowledge your feelings\n• Consider reaching out to a friend or loved one\n• Try some gentle physical activity\n• Practice gratitude by noting 3 good things today\n• Consider professional support if these feelings persist";
  }
  // Analyze for anger indicators
  else if (input.includes("angry") || input.includes("mad") || input.includes("frustrated") || 
           input.includes("irritated") || input.includes("annoyed") || input.includes("furious")) {
    emotion = "angry";
    suggestions = "I can see you're feeling frustrated. Here are some helpful approaches:\n\n• Take a step back and count to 10\n• Try some physical activity to release tension\n• Practice deep breathing or meditation\n• Consider what's really bothering you\n• Take a break from the situation if possible";
  }
  // Analyze for happiness indicators
  else if (input.includes("happy") || input.includes("great") || input.includes("excited") || 
           input.includes("wonderful") || input.includes("amazing") || input.includes("fantastic")) {
    emotion = "happy";
    suggestions = "That's wonderful to hear! Here are some ways to maintain this positive energy:\n\n• Share your joy with others\n• Take time to appreciate this moment\n• Consider what contributed to your happiness\n• Use this energy to tackle challenging tasks\n• Practice gratitude to sustain positive feelings";
  }
  // Analyze for tiredness indicators
  else if (input.includes("tired") || input.includes("exhausted") || input.includes("sleepy") || 
           input.includes("fatigued") || input.includes("drained") || input.includes("burned out")) {
    emotion = "tired";
    suggestions = "It sounds like you need some rest. Here are some suggestions:\n\n• Take a proper break or nap if possible\n• Ensure you're staying hydrated\n• Check your sleep schedule\n• Try some gentle stretching or movement\n• Consider reducing screen time\n• Practice the 20-20-20 rule for eye rest";
  }
  // Default response for neutral or unclear emotions
  else {
    emotion = "neutral";
    suggestions = "Thanks for sharing. Here are some general wellness tips:\n\n• Take regular breaks from your screen\n• Stay hydrated throughout the day\n• Practice good posture\n• Get some fresh air if possible\n• Remember to blink regularly to keep your eyes moist\n• Consider your work-life balance";
  }

  return {
    emotion,
    suggestions
  };
}
