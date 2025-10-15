import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Award, Heart } from "lucide-react";


const mentalHealthFacts = [
  {
    percentage: "53%",
    description: "Of Americans experience declining mental well-being, and isolation and stress over the past two years of the world pandemic have made the situation worse.",
    color: "text-pink-500",
    bgColor: "bg-pink-50 dark:bg-pink-950/20"
  },
  {
    percentage: "26%", 
    description: "Or 50 million U.S. adults over the age of 18 grapple with mental health conditions every year, and half of that number do not receive proper mental health support.",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20"
  },
  {
    percentage: "44%",
    description: "Of Young people, 18-29-year-olds experience time-to-time symptoms of depression, like melancholy, disinterest, and lack of motivation.",
    color: "text-orange-500", 
    bgColor: "bg-orange-50 dark:bg-orange-950/20"
  },
  {
    percentage: "32%",
    description: "A number of American adults experience anxiety disorders, which impact their psychological well-being and ability to function day-to-day.",
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/20"
  }
];

export function Stats() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* App stats section */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join Millions Becoming Self-Aware with{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Breeze
            </span>
          </h2>
        </div>

        {/* Mental health facts section */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Why Mental Well-being{" "}
            <span className="bg-gradient-secondary bg-clip-text text-transparent">
              Matters?
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {mentalHealthFacts.map((fact, index) => (
            <Card 
              key={index} 
              className={`glass border-0 hover-lift animate-fade-in-up ${fact.bgColor}`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <CardContent className="p-8">
                <div className="flex items-start space-x-6">
                  <div className={`text-4xl md:text-5xl font-bold ${fact.color}`}>
                    {fact.percentage}
                  </div>
                  <p className="text-muted-foreground leading-relaxed flex-1">
                    {fact.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}