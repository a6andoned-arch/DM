import { motion } from "framer-motion";

export function LoadingCrystal({ text = "Divining..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-6">
      <div className="relative">
        {/* Outer rotating rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 rounded-full border border-primary/20 border-t-primary/60 border-b-transparent absolute top-[-12px] left-[-12px]"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 rounded-full border border-accent/20 border-r-accent/60 border-l-transparent absolute top-[-28px] left-[-28px]"
        />

        {/* Center Crystal Ball */}
        <motion.div
          animate={{ 
            boxShadow: [
              "0 0 20px rgba(157, 78, 221, 0.2)",
              "0 0 40px rgba(157, 78, 221, 0.6)",
              "0 0 20px rgba(157, 78, 221, 0.2)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/40 via-secondary to-black relative overflow-hidden backdrop-blur-sm z-10"
        >
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent opacity-50"
          />
        </motion.div>
      </div>
      
      <motion.p 
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="font-display text-xl text-primary/80 tracking-widest uppercase"
      >
        {text}
      </motion.p>
    </div>
  );
}
