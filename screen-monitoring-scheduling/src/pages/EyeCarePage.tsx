"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Lightbulb, CheckCircle } from "lucide-react";
import { useState } from "react";

const eyeCareTips = [
  {
    title: "Follow the 20-20-20 Rule",
    description: "Every 20 minutes, take a 20-second break and look at something 20 feet away. This helps reduce eye strain.",
  },
  {
    title: "Adjust Your Monitor",
    description: "Position your screen about an arm's length away and ensure the top of the screen is at or slightly below eye level.",
  },
  {
    title: "Blink Often",
    description: "Blinking keeps your eyes moist and reduces dryness. Make a conscious effort to blink more, especially during long screen sessions.",
  },
  {
    title: "Adjust Screen Brightness",
    description: "Match your screen's brightness to the lighting in your room. Avoid using a very bright screen in a dark room.",
  },
   {
    title: "Stay Hydrated",
    description: "Drinking enough water throughout the day helps prevent your eyes from getting dry and irritated.",
  },
   {
    title: "Take Regular Breaks",
    description: "In addition to the 20-20-20 rule, take longer breaks every hour or two. Get up, stretch, and walk around for a few minutes.",
  },
];


export default function EyeCarePage() {
    const [randomTip, setRandomTip] = useState(eyeCareTips[0]);

    const showNewTip = () => {
        const newTip = eyeCareTips[Math.floor(Math.random() * eyeCareTips.length)];
        setRandomTip(newTip);
    }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <Eye className="h-8 w-8" /> Eye Care Suggestions
        </h1>
        <p className="text-muted-foreground mt-2">
          Protect your eyes from strain with these simple and effective tips.
        </p>
      </div>

      <Card className="bg-primary/10 border-primary/20">
        <CardHeader className="flex flex-row items-start space-x-4">
             <Lightbulb className="h-8 w-8 text-primary mt-1" />
            <div>
                <CardTitle className="font-headline">{randomTip.title}</CardTitle>
                <CardDescription className="pt-2 text-foreground/80">{randomTip.description}</CardDescription>
            </div>
        </CardHeader>
        <CardContent>
            <Button onClick={showNewTip}>
                Show Me Another Tip
            </Button>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Your Eye Care Checklist</CardTitle>
          <CardDescription>
            Incorporate these habits into your daily routine for better eye health.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {eyeCareTips.map((tip, index) => (
               <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 shrink-0" />
                    <div>
                      <h4 className="font-semibold">{tip.title}</h4>
                      <p className="text-muted-foreground text-sm">{tip.description}</p>
                    </div>
                </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
