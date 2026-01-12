import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, AlertTriangle, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DarkMagic() {
  const [question, setQuestion] = useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (question: string) => {
      const res = await apiRequest("POST", "/api/dark-magic/search", { question });
      return res.json();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "The shadows remain silent",
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    mutation.mutate(question);
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-serif text-primary mb-4 tracking-tighter">Shadow Search</h1>
        <p className="text-muted-foreground text-lg">Unveil the forbidden rituals hidden within the digital void.</p>
      </motion.div>

      <Card className="bg-card/50 backdrop-blur-sm border-primary/20 mb-12">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder="What ritual do you seek?..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="bg-background/50 border-primary/30 focus-visible:ring-primary"
            />
            <Button type="submit" disabled={mutation.isPending} className="bg-primary hover:bg-primary/90">
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2 hidden sm:inline">Summon</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      <AnimatePresence>
        {mutation.data && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Forbidden Warning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-destructive/90 italic font-medium">{mutation.data.warning}</p>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-card/80">
              <CardHeader>
                <CardTitle className="text-primary font-serif italic text-2xl">The Ritual</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
                  {mutation.data.solution}
                </div>
              </CardContent>
            </Card>

            {mutation.data.sources && mutation.data.sources.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {mutation.data.sources.map((source: string, i: number) => (
                  <a
                    key={i}
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Source {i + 1}
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
