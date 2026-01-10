import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tarotInputSchema, type TarotInput } from "@shared/schema";
import { useDrawTarot } from "@/hooks/use-fortune";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingCrystal } from "@/components/LoadingCrystal";
import { ArrowLeft, RefreshCw } from "lucide-react";

// Types for response
type TarotCard = { name: string; meaning: string; image?: string };

export default function Tarot() {
  const [result, setResult] = useState<{ reading: string; cards: TarotCard[]; reflection: string } | null>(null);
  
  const drawTarot = useDrawTarot();

  const form = useForm<TarotInput>({
    resolver: zodResolver(tarotInputSchema),
    defaultValues: {
      question: "",
      spread: "single"
    }
  });

  const onSubmit = (data: TarotInput) => {
    drawTarot.mutate(data, {
      onSuccess: (res) => setResult(res)
    });
  };

  const reset = () => {
    setResult(null);
    form.reset();
  };

  if (drawTarot.isPending) {
    return <LoadingCrystal text="Consulting the Spirits..." />;
  }

  // === RESULTS VIEW ===
  if (result) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex items-center justify-between">
          <Button onClick={reset} variant="ghost" className="text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" /> Ask Another Question
          </Button>
          <h2 className="text-3xl font-display text-primary">Your Reading</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {result.cards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ delay: idx * 0.3, duration: 0.8 }}
              className="perspective-1000"
            >
              <div className="mystic-card h-full bg-black/40 border-primary/20 flex flex-col">
                <div className="aspect-[2/3] rounded-lg bg-gradient-to-br from-indigo-900/50 to-purple-900/50 mb-4 border border-white/10 relative overflow-hidden group">
                  {/* Unsplash placeholder since we don't have real card images yet */}
                  {/* tarot card art */}
                  <img 
                    src={`https://images.unsplash.com/photo-1632349887754-00e1237a3479?auto=format&fit=crop&w=400&q=80`} 
                    alt="Tarot Card Back" 
                    className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <span className="text-6xl font-display text-primary/20 font-bold">{idx + 1}</span>
                  </div>
                </div>
                <h3 className="text-xl font-display font-bold text-primary mb-2 text-center">{card.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed text-center">{card.meaning}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <Card className="glass-panel border-primary/10">
          <CardContent className="p-8 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-3">Interpretation</h3>
              <p className="text-gray-300 leading-relaxed font-light">{result.reading}</p>
            </div>
            
            <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            
            <div>
              <h3 className="text-xl font-bold text-primary mb-3">Spiritual Reflection</h3>
              <p className="text-gray-300 italic font-serif text-lg leading-relaxed">"{result.reflection}"</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // === INPUT FORM VIEW ===
  return (
    <div className="max-w-xl mx-auto py-12">
      <div className="text-center mb-10 space-y-4">
        <h1 className="text-4xl md:text-5xl font-display font-bold gold-gradient-text">Tarot Divination</h1>
        <p className="text-muted-foreground">Focus your energy on a question, and let the cards guide you.</p>
      </div>

      <Card className="bg-black/40 border-primary/20 shadow-2xl relative overflow-hidden">
        {/* Glow effect behind form */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/5 blur-[80px] -z-10" />

        <CardContent className="p-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">Your Question</label>
              <Input
                {...form.register("question")}
                placeholder="What does the future hold for my career?"
                className="bg-black/20 border-white/10 h-12 focus:border-primary/50 text-lg placeholder:text-muted-foreground/50"
              />
              {form.formState.errors.question && (
                <p className="text-red-400 text-xs">{form.formState.errors.question.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">Spread Type</label>
              <Select 
                onValueChange={(val) => form.setValue("spread", val as any)}
                defaultValue="single"
              >
                <SelectTrigger className="bg-black/20 border-white/10 h-12 focus:border-primary/50">
                  <SelectValue placeholder="Select a spread" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  <SelectItem value="single">Single Card (Quick Insight)</SelectItem>
                  <SelectItem value="three-card">Three Cards (Past, Present, Future)</SelectItem>
                  <SelectItem value="celtic-cross">Celtic Cross (Comprehensive - 10 Cards)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary/80 to-amber-500/80 hover:from-primary hover:to-amber-500 text-black shadow-[0_0_20px_rgba(255,215,0,0.2)] hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] transition-all duration-300"
            >
              <RefreshCw className="mr-2 w-5 h-5" /> Draw Cards
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Decorative Card Stack Animation */}
      <div className="mt-12 flex justify-center perspective-1000 h-24">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ y: 0 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, delay: i * 0.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-24 bg-gradient-to-br from-indigo-900 to-purple-900 border border-white/20 rounded-md -ml-8 shadow-xl first:ml-0"
            style={{ zIndex: i }}
          />
        ))}
      </div>
    </div>
  );
}
