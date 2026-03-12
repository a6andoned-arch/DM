import type { Express, Request } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import { db } from "./db";
import { memeBattles, memes, memeUsers, memeVotes } from "@shared/schema";
import { desc, eq, or, sql } from "drizzle-orm";
import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const authSignupSchema = z.object({
  username: z.string().trim().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

const authLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const createMemeSchema = z.object({
  title: z.string().trim().min(2).max(120),
  caption: z.string().trim().max(400).optional(),
  imageBase64: z.string().min(1),
});

const createBattleSchema = z.object({
  memeAId: z.number().int().positive(),
  memeBId: z.number().int().positive(),
});

const castVoteSchema = z.object({
  memeId: z.number().int().positive(),
});

const TOKEN_SECRET = process.env.MEME_AUTH_SECRET || "meme-battle-secret-change-me";

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const digest = pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
  return `${salt}:${digest}`;
}

function verifyPassword(password: string, stored: string) {
  const [salt, digest] = stored.split(":");
  if (!salt || !digest) return false;
  const testDigest = pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
  return timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(testDigest, "hex"));
}

function signToken(payload: { userId: number; email: string }) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", TOKEN_SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function verifyToken(token: string) {
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = createHmac("sha256", TOKEN_SECRET).update(data).digest("base64url");
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
  return payload as { userId: number; email: string };
}

function getToken(req: Request) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

async function requireAuth(req: Request, res: any) {
  const token = getToken(req);
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }

  const payload = verifyToken(token);
  if (!payload?.userId) {
    res.status(401).json({ message: "Invalid token" });
    return null;
  }

  const user = await db.query.memeUsers.findFirst({
    where: eq(memeUsers.id, payload.userId),
  });

  if (!user) {
    res.status(401).json({ message: "User not found" });
    return null;
  }

  return user;
}

async function uploadToImgBB(base64Image: string) {
  const imgbbKey = process.env.IMGBB_API_KEY;
  if (!imgbbKey) {
    throw new Error("IMGBB_API_KEY is missing");
  }

  const formData = new URLSearchParams();
  formData.append("image", base64Image.replace(/^data:image\/[a-zA-Z]+;base64,/, ""));

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
    method: "POST",
    body: formData,
  });

  const json = await response.json() as any;
  if (!response.ok || !json?.success) {
    throw new Error("Image upload failed");
  }

  return {
    imageUrl: json.data.url as string,
    deleteUrl: json.data.delete_url as string | undefined,
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Meme Auth + Battles
  app.post("/api/meme/auth/signup", async (req, res) => {
    try {
      const input = authSignupSchema.parse(req.body);
      const existing = await db.query.memeUsers.findFirst({
        where: or(eq(memeUsers.email, input.email), eq(memeUsers.username, input.username)),
      });

      if (existing) {
        return res.status(409).json({ message: "User already exists" });
      }

      const [user] = await db.insert(memeUsers).values({
        username: input.username,
        email: input.email,
        passwordHash: hashPassword(input.password),
      }).returning({
        id: memeUsers.id,
        username: memeUsers.username,
        email: memeUsers.email,
      });

      const token = signToken({ userId: user.id, email: user.email });
      res.json({ token, user });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Signup failed" });
    }
  });

  app.post("/api/meme/auth/login", async (req, res) => {
    try {
      const input = authLoginSchema.parse(req.body);
      const user = await db.query.memeUsers.findFirst({
        where: eq(memeUsers.email, input.email),
      });

      if (!user || !verifyPassword(input.password, user.passwordHash)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = signToken({ userId: user.id, email: user.email });
      res.json({
        token,
        user: { id: user.id, username: user.username, email: user.email },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/meme/me", async (req, res) => {
    const user = await requireAuth(req, res);
    if (!user) return;
    res.json({ id: user.id, username: user.username, email: user.email });
  });

  app.post("/api/meme/memes", async (req, res) => {
    try {
      const user = await requireAuth(req, res);
      if (!user) return;

      const input = createMemeSchema.parse(req.body);
      const upload = await uploadToImgBB(input.imageBase64);

      const [meme] = await db.insert(memes).values({
        userId: user.id,
        title: input.title,
        caption: input.caption || "",
        imageUrl: upload.imageUrl,
        imageDeleteUrl: upload.deleteUrl,
      }).returning();

      res.json(meme);
    } catch (error) {
      console.error("Create meme error:", error);
      res.status(500).json({ message: "Could not create meme" });
    }
  });

  app.get("/api/meme/memes", async (_req, res) => {
    try {
      const items = await db.select({
        id: memes.id,
        title: memes.title,
        caption: memes.caption,
        imageUrl: memes.imageUrl,
        createdAt: memes.createdAt,
        userId: memes.userId,
        username: memeUsers.username,
      }).from(memes)
        .innerJoin(memeUsers, eq(memes.userId, memeUsers.id))
        .orderBy(desc(memes.id));

      res.json(items);
    } catch (error) {
      console.error("List memes error:", error);
      res.status(500).json({ message: "Could not load memes" });
    }
  });

  app.post("/api/meme/battles", async (req, res) => {
    try {
      const user = await requireAuth(req, res);
      if (!user) return;
      const input = createBattleSchema.parse(req.body);

      if (input.memeAId === input.memeBId) {
        return res.status(400).json({ message: "Choose two different memes" });
      }

      const [battle] = await db.insert(memeBattles).values({
        createdByUserId: user.id,
        memeAId: input.memeAId,
        memeBId: input.memeBId,
        status: "active",
      }).returning();

      res.json(battle);
    } catch (error) {
      console.error("Create battle error:", error);
      res.status(500).json({ message: "Could not create battle" });
    }
  });

  app.get("/api/meme/battles", async (_req, res) => {
    try {
      const rows = await db.execute(sql`
        select
          b.id,
          b.status,
          b.created_at as "createdAt",
          ma.id as "memeAId",
          ma.title as "memeATitle",
          ma.caption as "memeACaption",
          ma.image_url as "memeAImageUrl",
          ua.username as "memeAOwner",
          mb.id as "memeBId",
          mb.title as "memeBTitle",
          mb.caption as "memeBCaption",
          mb.image_url as "memeBImageUrl",
          ub.username as "memeBOwner",
          coalesce(sum(case when v.meme_id = ma.id then 1 else 0 end), 0)::int as "votesA",
          coalesce(sum(case when v.meme_id = mb.id then 1 else 0 end), 0)::int as "votesB"
        from meme_battles b
        inner join memes ma on b.meme_a_id = ma.id
        inner join meme_users ua on ma.user_id = ua.id
        inner join memes mb on b.meme_b_id = mb.id
        inner join meme_users ub on mb.user_id = ub.id
        left join meme_votes v on v.battle_id = b.id
        group by b.id, ma.id, mb.id, ua.username, ub.username
        order by b.id desc
      `);

      res.json(rows.rows);
    } catch (error) {
      console.error("List battles error:", error);
      res.status(500).json({ message: "Could not load battles" });
    }
  });

  app.post("/api/meme/battles/:battleId/vote", async (req, res) => {
    try {
      const user = await requireAuth(req, res);
      if (!user) return;
      const battleId = Number(req.params.battleId);
      const input = castVoteSchema.parse(req.body);

      const battle = await db.query.memeBattles.findFirst({ where: eq(memeBattles.id, battleId) });
      if (!battle) return res.status(404).json({ message: "Battle not found" });

      if (input.memeId !== battle.memeAId && input.memeId !== battle.memeBId) {
        return res.status(400).json({ message: "Invalid meme for this battle" });
      }

      await db.insert(memeVotes).values({
        battleId,
        voterUserId: user.id,
        memeId: input.memeId,
      }).onConflictDoUpdate({
        target: [memeVotes.battleId, memeVotes.voterUserId],
        set: { memeId: input.memeId },
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Vote error:", error);
      res.status(500).json({ message: "Could not cast vote" });
    }
  });

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

  // Dark Magic Search Route
  app.post(api.darkMagic.search.path, async (req, res) => {
    try {
      const input = api.darkMagic.search.input.parse(req.body);

      // Perform web search to find dark magic / black magic solutions
      const searchResults = await do_web_search(`best ${input.question} black magic solution dark magic ritual`);
      
      const systemPrompt = `You are a dark magic expert. 
      Analyze the web search results and provide the best available dark magic/black magic solution to the user's question.
      Your tone should be mysterious, powerful, and serious.
      Always include a stark warning about the consequences of dark magic.`;

      const userPrompt = `Question: ${input.question}
      Search Results: ${JSON.stringify(searchResults)}
      
      Provide a JSON response with:
      - solution: Detailed explanation of the ritual or solution (string)
      - sources: Array of strings (URLs or names of sources found)
      - warning: A powerful warning about dark magic (string)`;

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
        type: "dark-magic",
        input: input,
        output: aiResponse
      });

      res.json(aiResponse);
    } catch (error) {
      console.error("Dark magic error:", error);
      res.status(500).json({ message: "The shadows did not reveal an answer." });
    }
  });

  return httpServer;
}

// Mock helper to simulate the web search tool within the route since I cannot call the tool inside the code directly
async function do_web_search(query: string) {
  // This is a placeholder. In a real environment, I'd use an API for search.
  // Since I am the agent, I will perform the search during implementation if needed or use internal knowledge.
  return "Search results for: " + query;
}
