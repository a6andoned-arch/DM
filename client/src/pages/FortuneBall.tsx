import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fortuneBallInputSchema, type FortuneBallInput } from "@shared/schema";
import { useShakeFortuneBall } from "@/hooks/use-fortune";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";

export default function FortuneBall() {
  const [showAnswer, setShowAnswer] = useState(false);
  const [result, setResult] = useState<{ answer: string; detailedMessage: string; type: string } | null>(null);
  
  const shakeBall = useShakeFortuneBall();
  
  const form = useForm<FortuneBallInput>({
    resolver: zodResolver(fortuneBallInputSchema),
    defaultValues: { question: "" }
  });

  const onSubmit = (data: FortuneBallInput) => {
    setShowAnswer(false);
    shakeBall.mutate(data, {
      onSuccess: (res) => {
        setResult(res);
        // Delay showing answer for dramatic effect
        setTimeout(() => setShowAnswer(true), 2000);
      }
    });
  };

  const isShaking = shakeBall.isPending;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 relative overflow-hidden">
      
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-radial-gradient from-purple-900/20 via-transparent to-transparent opacity-50 pointer-events-none" />

      <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 z-10">Fortune Ball</h1>
      <p className="text-primary/80 mb-12 z-10 font-medium tracking-wide text-sm bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
        100,000+ Cosmic Possibilities
      </p>

      {/* THE CRYSTAL BALL */}
      <div className="relative w-80 h-80 mb-12 flex items-center justify-center perspective-1000 z-10">
        <motion.div
          animate={isShaking ? {
            x: [-5, 5, -5, 5, 0],
            y: [-5, 5, -5, 5, 0],
            rotate: [-2, 2, -2, 2, 0],
            scale: [1, 1.05, 0.95, 1]
          } : {
            y: [0, -10, 0] // Floating idle
          }}
          transition={isShaking ? { duration: 0.5, repeat: Infinity } : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="w-64 h-64 rounded-full relative shadow-[0_0_60px_rgba(147,51,234,0.4)] bg-black"
          style={{
            background: "radial-gradient(circle at 30% 30%, #4c1d95, #000)"
          }}
        >
          {/* Shine reflection */}
          <div className="absolute top-8 left-8 w-20 h-10 bg-white opacity-20 blur-xl rounded-full transform -rotate-45" />
          
          {/* Inner Glow / Window */}
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
            <AnimatePresence mode="wait">
              {showAnswer && result ? (
                <motion.div
                  key="answer"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative z-20"
                >
                  <div 
                    className={`
                      w-32 h-32 flex items-center justify-center rounded-full 
                      bg-gradient-to-br from-indigo-900 to-black border-4 border-indigo-500/30
                      shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]
                    `}
                  >
                    <span className="text-indigo-200 font-bold text-lg drop-shadow-md leading-tight px-2">
                      {result.answer}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="eight"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-4xl text-white/10 font-display font-bold"
                >
                  8
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Base Shadow */}
        <div className="absolute bottom-[-20px] w-40 h-10 bg-black/50 blur-xl rounded-[100%]" />
      </div>

      {/* Interaction Form */}
      <div className="w-full max-w-md z-10 px-4">
        {showAnswer && result ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6 bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10"
          >
            <p className="text-gray-300 italic">"{result.detailedMessage}"</p>
            <Button 
              onClick={() => { setShowAnswer(false); form.setValue("question", ""); }}
              variant="outline"
              className="border-primary/50 text-primary hover:bg-primary/10"
            >
              Ask Another Question
            </Button>
          </motion.div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Input 
              {...form.register("question")}
              placeholder="Will I find success soon?" 
              disabled={isShaking}
              className="bg-black/40 border-primary/30 h-14 text-center text-lg rounded-full focus:ring-primary/50 placeholder:text-white/30"
            />
            <Button 
              type="submit" 
              disabled={isShaking || !form.watch("question")}
              className="w-full h-12 rounded-full font-bold text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/20"
            >
              {isShaking ? "Consulting the Void..." : (
                <span className="flex items-center gap-2">Ask the Oracle <Sparkles className="w-4 h-4" /></span>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
