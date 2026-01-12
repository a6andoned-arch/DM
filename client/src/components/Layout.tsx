import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Moon, Sun, Stars, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const navItems = [
    { label: "Home", href: "/", icon: <Stars className="w-4 h-4" /> },
    { label: "Tarot", href: "/tarot", icon: <Moon className="w-4 h-4" /> },
    { label: "Fortune Ball", href: "/fortune-ball", icon: <Sparkles className="w-4 h-4" /> },
    { label: "Kundali", href: "/kundali", icon: <Sun className="w-4 h-4" /> },
    { label: "Numerology", href: "/numerology", icon: <Stars className="w-4 h-4" /> },
    { label: "Dark Magic", href: "/dark-magic", icon: <Moon className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-hidden">
      {/* Mystic Ambient Background Elements */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <header className="sticky top-0 z-[100] w-full border-b border-primary/10 bg-black/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center group cursor-pointer">
            <div className="relative">
              <img 
                src="https://i.ibb.co/4wf90k3q/Dark-Magic.png" 
                className="h-12 w-auto object-contain transition-transform duration-500 group-hover:scale-105" 
                alt="Dark Magic" 
              />
              <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`
                  flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary
                  ${location === item.href ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}
                `}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-primary hover:bg-white/5"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Mobile Nav Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl overflow-hidden"
            >
              <nav className="flex flex-col p-4 gap-4">
                {navItems.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg transition-colors
                      ${location === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-white/5"}
                    `}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/5 py-8 mt-12 bg-black/20">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-8">
            <a 
              href="https://tango.me/voido" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2 border border-primary/50 bg-black/40 text-primary rounded-full font-display text-sm hover:bg-primary hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            >
              <Sparkles className="w-4 h-4" />
              Support the Shadows
            </a>
          </div>
          <div className="text-muted-foreground text-sm font-display">
            <p className="mb-2">© {new Date().getFullYear()} Dark Magic. Unveil your destiny.</p>
            <div className="flex justify-center gap-4 text-xs opacity-60">
              <span>Tarot Readings</span> • 
              <span>Vedic Kundali</span> • 
              <span>Numerology Insights</span> •
              <span>Shadow Search</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
