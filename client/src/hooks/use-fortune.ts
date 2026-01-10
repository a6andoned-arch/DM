import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { 
  TarotInput, 
  FortuneBallInput, 
  KundaliInput, 
  NumerologyInput 
} from "@shared/schema";

// Helper to log Zod errors
function parseWithLogging<T>(schema: Zod.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw new Error(`Invalid response for ${label}`);
  }
  return result.data;
}

// === TAROT ===
export function useDrawTarot() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: TarotInput) => {
      // Validate input (though form usually handles this, extra safety)
      const validRequest = api.tarot.draw.input.parse(data);
      
      const res = await fetch(api.tarot.draw.path, {
        method: api.tarot.draw.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRequest),
      });
      
      if (!res.ok) throw new Error("The spirits are silent (Network Error)");
      
      const json = await res.json();
      return parseWithLogging(api.tarot.draw.responses[200], json, "tarot.draw");
    },
    onError: (error) => {
      toast({
        title: "Divination Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

// === FORTUNE BALL ===
export function useShakeFortuneBall() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: FortuneBallInput) => {
      const validRequest = api.fortuneBall.shake.input.parse(data);

      const res = await fetch(api.fortuneBall.shake.path, {
        method: api.fortuneBall.shake.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRequest),
      });

      if (!res.ok) throw new Error("The crystal is cloudy (Network Error)");

      const json = await res.json();
      return parseWithLogging(api.fortuneBall.shake.responses[200], json, "fortuneBall.shake");
    },
    onError: (error) => {
      toast({
        title: "Vision Obscured",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

// === KUNDALI ===
export function useGenerateKundali() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: KundaliInput) => {
      const validRequest = api.kundali.generate.input.parse(data);

      const res = await fetch(api.kundali.generate.path, {
        method: api.kundali.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRequest),
      });

      if (!res.ok) throw new Error("Celestial alignment failed (Network Error)");

      const json = await res.json();
      return parseWithLogging(api.kundali.generate.responses[200], json, "kundali.generate");
    },
    onError: (error) => {
      toast({
        title: "Chart Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

// === NUMEROLOGY ===
export function useGenerateNumerology() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: NumerologyInput) => {
      const validRequest = api.numerology.generate.input.parse(data);

      const res = await fetch(api.numerology.generate.path, {
        method: api.numerology.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRequest),
      });

      if (!res.ok) throw new Error("Calculation error (Network Error)");

      const json = await res.json();
      return parseWithLogging(api.numerology.generate.responses[200], json, "numerology.generate");
    },
    onError: (error) => {
      toast({
        title: "Numerology Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}
