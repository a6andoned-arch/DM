import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const readings = pgTable("readings", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // tarot, fortune-ball, kundali, numerology, dark-magic
  input: jsonb("input").notNull(), // User input (name, dob, question, card selection)
  output: jsonb("output").notNull(), // The AI generated response
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertReadingSchema = createInsertSchema(readings).omit({ id: true, createdAt: true });

export type Reading = typeof readings.$inferSelect;
export type InsertReading = z.infer<typeof insertReadingSchema>;

// Input schemas for each type
export const tarotInputSchema = z.object({
  question: z.string(),
  spread: z.enum(["single", "three-card", "celtic-cross"]),
  cards: z.array(z.string()).optional(), // Cards drawn
});

export const fortuneBallInputSchema = z.object({
  question: z.string(),
});

export const kundaliInputSchema = z.object({
  name: z.string(),
  dob: z.string(), // ISO date string
  pob: z.string(), // Place of birth
  tob: z.string(), // Time of birth
});

export const numerologyInputSchema = z.object({
  name: z.string(),
  dob: z.string(), // ISO date string
});

export const darkMagicInputSchema = z.object({
  question: z.string(),
});

export type TarotInput = z.infer<typeof tarotInputSchema>;
export type FortuneBallInput = z.infer<typeof fortuneBallInputSchema>;
export type KundaliInput = z.infer<typeof kundaliInputSchema>;
export type NumerologyInput = z.infer<typeof numerologyInputSchema>;
export type DarkMagicInput = z.infer<typeof darkMagicInputSchema>;
