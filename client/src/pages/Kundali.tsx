import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { kundaliInputSchema, type KundaliInput } from "@shared/schema";
import { useGenerateKundali } from "@/hooks/use-fortune";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingCrystal } from "@/components/LoadingCrystal";
import { Sun, Moon, MapPin, Clock, Calendar } from "lucide-react";

export default function Kundali() {
  const [result, setResult] = useState<any>(null); // Type inferred from API return
  const generateKundali = useGenerateKundali();

  const form = useForm<KundaliInput>({
    resolver: zodResolver(kundaliInputSchema),
    defaultValues: {
      name: "",
      dob: "",
      tob: "",
      pob: ""
    }
  });

  const onSubmit = (data: KundaliInput) => {
    generateKundali.mutate(data, {
      onSuccess: (res) => setResult(res)
    });
  };

  if (generateKundali.isPending) {
    return <LoadingCrystal text="Aligning Planets..." />;
  }

  // === RESULTS ===
  if (result) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-primary mb-2">Vedic Birth Chart</h1>
          <p className="text-muted-foreground">Prepared for {form.getValues("name")}</p>
        </div>

        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-white/10">
            <TabsTrigger value="chart">Planetary Chart</TabsTrigger>
            <TabsTrigger value="predictions">Life Predictions</TabsTrigger>
            <TabsTrigger value="fortune">Overall Fortune</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Visual Chart Representation (Text/Abstract) */}
              <Card className="glass-panel border-primary/20 md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Sun className="w-5 h-5" /> Natal Chart Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-mono text-sm bg-black/50 p-6 rounded-lg border border-white/5 whitespace-pre-wrap text-green-400/80 shadow-inner">
                    {result.chart}
                  </div>
                </CardContent>
              </Card>

              {/* Planetary Positions Table */}
              <Card className="glass-panel border-white/10 md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white">Planetary Positions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result.planetaryPositions.map((planet: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/5">
                        <span className="font-bold text-primary">{planet.planet}</span>
                        <div className="text-right">
                          <div className="text-sm text-white">{planet.sign}</div>
                          <div className="text-xs text-muted-foreground">{planet.position}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="mt-6 space-y-6">
            {Object.entries(result.predictions).map(([key, val]: [string, any]) => (
              <motion.div 
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-panel p-6 rounded-xl border-l-4 border-l-primary"
              >
                <h3 className="text-xl font-display font-bold capitalize text-primary mb-3">{key}</h3>
                <p className="text-gray-300 leading-relaxed">{val}</p>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="fortune" className="mt-6">
             <Card className="glass-panel bg-gradient-to-br from-amber-900/20 to-black border-amber-500/20">
              <CardContent className="p-8 text-center">
                <Sun className="w-12 h-12 text-amber-500 mx-auto mb-6 animate-pulse" />
                <h3 className="text-2xl font-display font-bold text-white mb-4">Your Cosmic Fortune</h3>
                <p className="text-lg text-amber-100/80 leading-loose italic">
                  "{result.fortune}"
                </p>
              </CardContent>
             </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center mt-8">
           <Button onClick={() => setResult(null)} variant="outline" className="border-white/20 hover:bg-white/10">
             Create New Chart
           </Button>
        </div>
      </div>
    );
  }

  // === FORM ===
  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center mb-10 space-y-4">
        <h1 className="text-4xl font-display font-bold gold-gradient-text">Create Kundali</h1>
        <p className="text-muted-foreground">Enter your birth details for precise Vedic calculations.</p>
      </div>

      <Card className="bg-black/40 border-white/10 shadow-2xl backdrop-blur-md">
        <CardContent className="p-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label>Full Name</Label>
                <Input {...form.register("name")} className="bg-black/20 border-white/10" placeholder="Arjun Sharma" />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Date of Birth</Label>
                <Input type="date" {...form.register("dob")} className="bg-black/20 border-white/10" />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Time of Birth</Label>
                <Input type="time" {...form.register("tob")} className="bg-black/20 border-white/10" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Place of Birth</Label>
                <Input {...form.register("pob")} className="bg-black/20 border-white/10" placeholder="City, Country" />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-lg font-bold bg-primary text-black hover:bg-amber-400">
              Generate Chart
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
