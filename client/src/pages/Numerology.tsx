import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { numerologyInputSchema, type NumerologyInput } from "@shared/schema";
import { useGenerateNumerology } from "@/hooks/use-fortune";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LoadingCrystal } from "@/components/LoadingCrystal";
import { Hash, Dna, Gem } from "lucide-react";

export default function Numerology() {
  const [result, setResult] = useState<any>(null);
  const generateNumerology = useGenerateNumerology();

  const form = useForm<NumerologyInput>({
    resolver: zodResolver(numerologyInputSchema),
    defaultValues: {
      name: "",
      dob: ""
    }
  });

  const onSubmit = (data: NumerologyInput) => {
    generateNumerology.mutate(data, {
      onSuccess: (res) => setResult(res)
    });
  };

  if (generateNumerology.isPending) {
    return <LoadingCrystal text="Decoding Numbers..." />;
  }

  // === RESULTS ===
  if (result) {
    return (
      <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-10 duration-700">
        <div className="text-center space-y-2">
          <h2 className="text-sm font-bold tracking-[0.3em] text-primary uppercase">Numerology Report</h2>
          <h1 className="text-4xl font-display font-bold text-white">The Power of Your Numbers</h1>
        </div>

        {/* Big Numbers Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: "Life Path", val: result.lifePathNumber, icon: <Dna className="w-5 h-5" />, color: "text-blue-400" },
            { label: "Destiny", val: result.destinyNumber, icon: <Hash className="w-5 h-5" />, color: "text-purple-400" },
            { label: "Soul Urge", val: result.soulUrgeNumber, icon: <Gem className="w-5 h-5" />, color: "text-pink-400" }
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.2 }}
              className="glass-panel p-8 rounded-2xl text-center relative overflow-hidden group hover:border-white/20 transition-colors"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className={`mb-4 flex justify-center ${item.color} opacity-80`}>{item.icon}</div>
              <div className="text-6xl font-display font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-500">
                {item.val}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest">{item.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Analysis Text */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-transparent border-0">
              <CardContent className="p-0">
                <h3 className="text-2xl font-display font-bold text-primary mb-4">Detailed Analysis</h3>
                <div className="space-y-4 text-gray-300 leading-relaxed text-lg font-light">
                  <p>{result.analysis}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel border-amber-500/20 bg-amber-950/10">
              <CardContent className="p-6">
                 <h4 className="text-amber-500 font-bold mb-2">Fortune Forecast</h4>
                 <p className="italic text-amber-100/80">"{result.fortune}"</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Lucky Numbers */}
            <Card className="glass-panel border-white/5">
              <CardContent className="p-6">
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Lucky Numbers</h4>
                <div className="flex flex-wrap gap-2">
                  {result.luckyNumbers.map((n: number) => (
                    <span key={n} className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-300 font-bold">
                      {n}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Unlucky Numbers */}
            <Card className="glass-panel border-white/5">
              <CardContent className="p-6">
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Numbers to Avoid</h4>
                <div className="flex flex-wrap gap-2">
                  {result.unluckyNumbers.map((n: number) => (
                    <span key={n} className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-300 font-bold">
                      {n}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Colors */}
            <Card className="glass-panel border-white/5">
               <CardContent className="p-6">
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Power Colors</h4>
                <div className="flex gap-2">
                  {result.favorableColors.map((color: string) => (
                    <div key={color} className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full border border-white/20 shadow-lg" style={{ backgroundColor: color.toLowerCase() }} />
                      <span className="text-[10px] uppercase text-white/50">{color}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="flex justify-center pt-8">
           <Button onClick={() => setResult(null)} variant="ghost" className="text-muted-foreground hover:text-white">
             Calculate Another
           </Button>
        </div>
      </div>
    );
  }

  // === FORM ===
  return (
    <div className="max-w-xl mx-auto py-12">
      <div className="text-center mb-10 space-y-4">
        <h1 className="text-4xl font-display font-bold gold-gradient-text">Numerology Calculator</h1>
        <p className="text-muted-foreground">Discover the hidden mathematical patterns of your life.</p>
      </div>

      <Card className="bg-black/40 border-primary/20 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
        <CardContent className="p-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-2">
              <Label>Full Name (as on birth certificate)</Label>
              <Input {...form.register("name")} className="bg-black/20 border-white/10 h-12 text-lg" placeholder="e.g. John Doe" />
            </div>

            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input type="date" {...form.register("dob")} className="bg-black/20 border-white/10 h-12 text-lg" />
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 shadow-lg shadow-purple-900/40"
            >
              Reveal My Numbers
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
