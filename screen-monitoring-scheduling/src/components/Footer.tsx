import { Link } from "react-router-dom";
import { Heart, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = {
  main: [
    { name: "Home", href: "/" },
    { name: "Tests", href: "/tests" },  
    { name: "Features", href: "/features" },
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" }
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "Contact", href: "/contact" }
  ],
  social: [
    { name: "Facebook", href: "#", icon: Facebook },
    { name: "Twitter", href: "#", icon: Twitter },
    { name: "Instagram", href: "#", icon: Instagram },
    { name: "YouTube", href: "#", icon: Youtube }
  ]
};

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © 2025 Breeze Wellbeing. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Made with ❤️ for mental wellness
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}