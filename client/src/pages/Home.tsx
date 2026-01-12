import { motion } from "framer-motion";
import { Link } from "wouter";
import { Sparkles, Moon, Sun, Stars, ArrowRight, Search } from "lucide-react";

const features = [
  {
    title: "Tarot Reading",
    desc: "Draw cards from the ancient deck to reveal hidden truths about your past, present, and future.",
    icon: <Moon className="w-8 h-8 text-primary" />,
    href: "/tarot",
    bg: "from-purple-900/50 to-indigo-900/50",
    delay: 0.1
  },
  {
    title: "Fortune Ball",
    desc: "Ask the mystical sphere your burning yes/no questions and receive guidance from the void.",
    icon: <Sparkles className="w-8 h-8 text-cyan-400" />,
    href: "/fortune-ball",
    bg: "from-blue-900/50 to-cyan-900/50",
    delay: 0.2
  },
  {
    title: "Vedic Kundali",
    desc: "Generate your complete birth chart with detailed planetary positions and life predictions.",
    icon: <Sun className="w-8 h-8 text-amber-500" />,
    href: "/kundali",
    bg: "from-orange-900/50 to-amber-900/50",
    delay: 0.3
  },
  {
    title: "Numerology",
    desc: "Unlock the secret power of numbers associated with your name and birth date.",
    icon: <Stars className="w-8 h-8 text-pink-400" />,
    href: "/numerology",
    bg: "from-pink-900/50 to-rose-900/50",
    delay: 0.4
  },
  {
    title: "Shadow Search",
    desc: "Unveil the forbidden rituals hidden within the digital void for your dark questions.",
    icon: <Search className="w-8 h-8 text-red-500" />,
    href: "/dark-magic",
    bg: "from-gray-900 to-red-950/40",
    delay: 0.5
  }
];

export default function Home() {
  return (
    <div className="flex flex-col gap-12 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="inline-block mb-4 p-2 rounded-full bg-primary/10 border border-primary/20 text-primary px-4 text-sm font-medium tracking-wider uppercase"
        >
          Explore Your Destiny
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tight drop-shadow-2xl">
          Dark Magic
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed font-light">
          Welcome to the shadows. Unlock the mysteries of the forbidden.
        </p>

        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto w-full px-4">
        {features.map((feature) => (
          <Link key={feature.title} href={feature.href}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: feature.delay }}
              className={`
                group relative h-full p-8 rounded-2xl border border-white/5 
                bg-gradient-to-br ${feature.bg} backdrop-blur-sm overflow-hidden
                hover:border-primary/30 transition-all duration-300 hover:-translate-y-1
              `}
            >
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
              
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 rounded-xl bg-black/30 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <ArrowRight className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              
              <h3 className="text-2xl font-display font-bold text-white mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          </Link>
        ))}
      </section>

      {/* Stock Image - Scenic Night Sky */}
      <div className="relative rounded-3xl overflow-hidden h-[300px] md:h-[400px] w-full max-w-6xl mx-auto mt-8 border border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-black/40 z-10 flex flex-col items-center justify-center text-center p-6">
          <h2 className="text-3xl md:text-5xl font-display text-white mb-4">Ready to seek the truth?</h2>
          <p className="text-white/80 max-w-lg mb-8">
            Your path is written in the cosmos. Let us help you read it.
          </p>
          <Link href="/tarot">
            <button className="px-8 py-3 bg-primary text-black font-bold rounded-full hover:bg-white transition-colors duration-300 transform hover:scale-105">
              Start a Reading
            </button>
          </Link>
        </div>
        {/* Unsplash image: Night sky with stars, mystical landscape */}
        <img 
          src="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2000&auto=format&fit=crop" 
          alt="Mystical night sky"
          className="w-full h-full object-cover opacity-80"
        />
      </div>
    </div>
  );
}
