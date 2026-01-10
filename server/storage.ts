import { db } from "./db";
import { readings, type InsertReading, type Reading } from "@shared/schema";

export interface IStorage {
  createReading(reading: InsertReading): Promise<Reading>;
  getReadingsByType(type: string): Promise<Reading[]>;
}

export class DatabaseStorage implements IStorage {
  async createReading(reading: InsertReading): Promise<Reading> {
    const [newReading] = await db.insert(readings).values(reading).returning();
    return newReading;
  }

  async getReadingsByType(type: string): Promise<Reading[]> {
    return await db.select().from(readings).where({ type });
  }
}

export const storage = new DatabaseStorage();
