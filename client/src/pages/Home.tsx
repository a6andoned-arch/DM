import { motion } from "framer-motion";
import { Link } from "wouter";
import { Sparkles, Moon, Sun, Stars, ArrowRight, Search, AlertTriangle, CircleDot, Hash } from "lucide-react";

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
    icon: <CircleDot className="w-8 h-8 text-cyan-400" />,
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
    icon: <Hash className="w-8 h-8 text-pink-400" />,
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

      {/* Disclaimer Section */}
      <div className="relative rounded-3xl overflow-hidden h-auto w-full max-w-6xl mx-auto mt-8 border border-white/10 shadow-2xl bg-black/40 backdrop-blur-md p-8">
        <div className="z-10 flex flex-col items-center justify-center text-center">
          <h2 className="text-2xl md:text-3xl font-display text-primary mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Disclaimer
          </h2>
          <div className="text-white/70 max-w-2xl text-sm leading-relaxed space-y-4">
            <p>
              The information and rituals provided on this website are for educational and entertainment purposes only. 
              Dark Magic/Black Magic practices involve deep spiritual and psychological complexities that can have unpredictable results.
            </p>
            <p>
              By using these tools, you acknowledge that you are responsible for your own actions and their consequences. 
              We do not promote harm or illegal activities. Consult with professionals for serious life decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
