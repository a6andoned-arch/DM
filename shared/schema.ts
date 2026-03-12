import { pgTable, text, serial, jsonb, integer, uniqueIndex } from "drizzle-orm/pg-core";
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

export const memeUsers = pgTable("meme_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
}, (table) => ({
  usernameIdx: uniqueIndex("meme_users_username_idx").on(table.username),
  emailIdx: uniqueIndex("meme_users_email_idx").on(table.email),
}));

export const memes = pgTable("memes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => memeUsers.id),
  title: text("title").notNull(),
  caption: text("caption"),
  imageUrl: text("image_url").notNull(),
  imageDeleteUrl: text("image_delete_url"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const memeBattles = pgTable("meme_battles", {
  id: serial("id").primaryKey(),
  createdByUserId: integer("created_by_user_id").notNull().references(() => memeUsers.id),
  memeAId: integer("meme_a_id").notNull().references(() => memes.id),
  memeBId: integer("meme_b_id").notNull().references(() => memes.id),
  status: text("status").notNull().default("active"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const memeVotes = pgTable("meme_votes", {
  id: serial("id").primaryKey(),
  battleId: integer("battle_id").notNull().references(() => memeBattles.id),
  voterUserId: integer("voter_user_id").notNull().references(() => memeUsers.id),
  memeId: integer("meme_id").notNull().references(() => memes.id),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
}, (table) => ({
  voteUniqueIdx: uniqueIndex("meme_votes_battle_voter_idx").on(table.battleId, table.voterUserId),
}));
