import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Heart, Zap, Activity } from "lucide-react";

const tests = [
  {
    id: "adhd",
    title: "ADHD Test",
    description: "Quick assessment to understand attention patterns",
    icon: Brain,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20"
  },
  {
    id: "trauma",
    title: "Childhood Trauma Test",
    description: "Explore your past experiences and their impact",
    icon: Heart,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950/20"
  },
  {
    id: "emotional",
    title: "Emotional Intelligence Test",
    description: "Measure your emotional awareness and skills",
    icon: Zap,
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/20"
  },
  {
    id: "wellbeing",
    title: "Wellbeing Test",
    description: "Comprehensive mental health assessment",
    icon: Activity,
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950/20"
  }
];

export function QuickTests() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Enhance Your{" "}
            <span className="bg-gradient-secondary bg-clip-text text-transparent">
              Self-Awareness?
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Try these quick tests and gain valuable insights into your mental well-being right away
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tests.map((test, index) => (
            <Card 
              key={test.id} 
              className="group hover-lift glass border-0 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto p-4 rounded-2xl ${test.bgColor} mb-4 group-hover:scale-110 transition-all`}>
                  <test.icon className={`h-8 w-8 ${test.color}`} />
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {test.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {test.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary"
                >
                  Take a Quiz
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: "600ms" }}>
          <Button variant="premium" size="lg" className="text-lg">
            View All Tests
          </Button>
        </div>
      </div>
    </section>
  );
}