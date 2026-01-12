import { z } from "zod";
import { tarotInputSchema, fortuneBallInputSchema, kundaliInputSchema, numerologyInputSchema, darkMagicInputSchema, readings } from "./schema";

export const api = {
  tarot: {
    draw: {
      method: "POST" as const,
      path: "/api/tarot/draw",
      input: tarotInputSchema,
      responses: {
        200: z.object({
          reading: z.string(),
          cards: z.array(z.object({
            name: z.string(),
            meaning: z.string(),
            image: z.string().optional() // placeholder for card image
          })),
          reflection: z.string()
        })
      }
    }
  },
  fortuneBall: {
    shake: {
      method: "POST" as const,
      path: "/api/fortune-ball/shake",
      input: fortuneBallInputSchema,
      responses: {
        200: z.object({
          answer: z.string(),
          type: z.enum(["positive", "negative", "neutral"]),
          detailedMessage: z.string()
        })
      }
    }
  },
  kundali: {
    generate: {
      method: "POST" as const,
      path: "/api/kundali/generate",
      input: kundaliInputSchema,
      responses: {
        200: z.object({
          chart: z.string(), // Text representation or description of the chart
          fortune: z.string(),
          planetaryPositions: z.array(z.object({
            planet: z.string(),
            position: z.string(),
            sign: z.string()
          })),
          predictions: z.object({
            general: z.string(),
            career: z.string(),
            love: z.string(),
            health: z.string()
          })
        })
      }
    }
  },
  numerology: {
    generate: {
      method: "POST" as const,
      path: "/api/numerology/generate",
      input: numerologyInputSchema,
      responses: {
        200: z.object({
          lifePathNumber: z.number(),
          destinyNumber: z.number(),
          soulUrgeNumber: z.number(),
          luckyNumbers: z.array(z.number()),
          unluckyNumbers: z.array(z.number()),
          favorableColors: z.array(z.string()),
          fortune: z.string(),
          analysis: z.string()
        })
      }
    }
  },
  darkMagic: {
    search: {
      method: "POST" as const,
      path: "/api/dark-magic/search",
      input: darkMagicInputSchema,
      responses: {
        200: z.object({
          solution: z.string(),
          sources: z.array(z.string()),
          warning: z.string()
        })
      }
    }
  }
};
