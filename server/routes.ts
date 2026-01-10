import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Tarot Route
  app.post(api.tarot.draw.path, async (req, res) => {
    try {
      const input = api.tarot.draw.input.parse(req.body);
      
      const systemPrompt = `You are a mystical Tarot reader with deep knowledge of symbolism, intuition, and fate. 
      Provide a reading based on the user's question and selected spread. 
      The reading should be profound, insightful, and detailed.`;

      const userPrompt = `Question: ${input.question}
      Spread: ${input.spread}
      Cards Drawn: ${input.cards?.join(", ") || "Please draw cards for me based on the spread."}
      
      Provide a JSON response with:
      - reading: Overall interpretation (string)
      - cards: Array of objects { name, meaning, image (leave empty) }
      - reflection: A final thought or advice (string)`;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      });

      const aiResponse = JSON.parse(response.choices[0].message.content || "{}");
      
      // Store the reading
      await storage.createReading({
        type: "tarot",
        input: input,
        output: aiResponse
      });

      res.json(aiResponse);
    } catch (error) {
      console.error("Tarot error:", error);
      res.status(500).json({ message: "Failed to generate tarot reading" });
    }
  });

  // Fortune Ball Route
  app.post(api.fortuneBall.shake.path, async (req, res) => {
    try {
      const input = api.fortuneBall.shake.input.parse(req.body);

      const systemPrompt = `You are a mystical Fortune Ball with infinite wisdom.
      Provide a direct answer to the user's question, but also a detailed mystical explanation.
      There are over 100,000 possible nuances in your answers.`;

      const userPrompt = `Question: ${input.question}
      
      Provide a JSON response with:
      - answer: Short direct answer (Yes/No/Maybe/Ask again later/Definite Yes/etc.)
      - type: "positive", "negative", or "neutral"
      - detailedMessage: A 2-3 sentence mystical explanation of why this is the answer.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      });

      const aiResponse = JSON.parse(response.choices[0].message.content || "{}");

      await storage.createReading({
        type: "fortune-ball",
        input: input,
        output: aiResponse
      });

      res.json(aiResponse);
    } catch (error) {
      console.error("Fortune ball error:", error);
      res.status(500).json({ message: "Failed to shake fortune ball" });
    }
  });

  // Kundali Route
  app.post(api.kundali.generate.path, async (req, res) => {
    try {
      const input = api.kundali.generate.input.parse(req.body);

      const systemPrompt = `You are an expert Vedic Astrologer. 
      Generate a comprehensive Kundali (Birth Chart) report based on the user's birth details.
      Include planetary positions, general prediction, career, love, and health.`;

      const userPrompt = `Name: ${input.name}
      DOB: ${input.dob}
      Time: ${input.tob}
      Place: ${input.pob}
      
      Provide a JSON response with:
      - chart: Text description of the Lagna chart
      - fortune: Overall fortune summary
      - planetaryPositions: Array of { planet, position, sign }
      - predictions: Object with keys: general, career, love, health (all strings)`;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      });

      const aiResponse = JSON.parse(response.choices[0].message.content || "{}");

      await storage.createReading({
        type: "kundali",
        input: input,
        output: aiResponse
      });

      res.json(aiResponse);
    } catch (error) {
      console.error("Kundali error:", error);
      res.status(500).json({ message: "Failed to generate Kundali" });
    }
  });

  // Numerology Route
  app.post(api.numerology.generate.path, async (req, res) => {
    try {
      const input = api.numerology.generate.input.parse(req.body);

      const systemPrompt = `You are an expert Numerologist.
      Calculate Life Path, Destiny, and Soul Urge numbers based on name and DOB.
      Provide a detailed analysis including lucky/unlucky numbers and colors.`;

      const userPrompt = `Name: ${input.name}
      DOB: ${input.dob}
      
      Provide a JSON response with:
      - lifePathNumber: number
      - destinyNumber: number
      - soulUrgeNumber: number
      - luckyNumbers: array of numbers
      - unluckyNumbers: array of numbers
      - favorableColors: array of strings
      - fortune: Short summary string
      - analysis: Detailed markdown string explaining the numbers and their impact on life.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      });

      const aiResponse = JSON.parse(response.choices[0].message.content || "{}");

      await storage.createReading({
        type: "numerology",
        input: input,
        output: aiResponse
      });

      res.json(aiResponse);
    } catch (error) {
      console.error("Numerology error:", error);
      res.status(500).json({ message: "Failed to generate Numerology report" });
    }
  });

  return httpServer;
}
