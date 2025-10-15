import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Award, Heart, Brain, Coffee, Activity } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import heroWellness from "@/assets/hero-wellness.jpg";



export function Hero() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url(${heroWellness})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-6">
              <Badge variant="secondary" className="text-sm px-4 py-2 hover-lift">
                AI-Powered Digital Wellness Platform
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Smart wellness app that{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  enhances your productivity
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-xl">
                WellnessAI is your intelligent companion for digital wellness. Track activity, 
                manage breaks with AI-powered suggestions, get weather-based food recommendations, 
                and maintain a healthy work-life balance.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {currentUser ? (
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="text-lg"
                  onClick={() => navigate('/dashboard')}
                >
                  <Brain className="h-5 w-5 mr-2" />
                  Go to Dashboard
                </Button>
              ) : (
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="text-lg"
                  onClick={() => navigate('/signin')}
                >
                  <Brain className="h-5 w-5 mr-2" />
                  Get Started
                </Button>
              )}
              
            </div>

            {/* Stats */}
          </div>

          {/* Right content - Hero image */}
          <div className="relative animate-fade-in-right">
            <div className="relative p-8 rounded-3xl glass hover-lift animate-float">
              <img
                src={heroWellness}
                alt="Breeze Wellbeing App Interface"
                className="w-full h-auto rounded-xl shadow-large"
              />
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 p-4 glass rounded-2xl animate-bounce-soft">
                <Heart className="h-6 w-6 text-primary animate-pulse-glow" />
              </div>
              
              <div className="absolute -bottom-4 -left-4 p-3 glass rounded-xl">
                <div className="text-center">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}