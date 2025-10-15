import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ScreenTimeTracker } from "@/components/ScreenTimeTracker";
import { QuickTests } from "@/components/QuickTests";
import { Stats } from "@/components/Stats";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <ScreenTimeTracker />
      <Stats />
      <Footer />
    </div>
  );
};

export default Index;
