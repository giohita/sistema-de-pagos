import { MongoClient, type Db } from "mongodb";
import { env } from "../config/env.js";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (!client) {
    if (!env.persistence.mongodbUri) {
      throw new Error("MONGODB_URI is not configured");
    }
    client = new MongoClient(env.persistence.mongodbUri);
    await client.connect();
  }
  return client;
}

export async function getMongoDb(): Promise<Db> {
  if (!db) {
    const mongoClient = await getMongoClient();
    db = mongoClient.db();
  }
  return db;
}

export async function closeMongoClient(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
