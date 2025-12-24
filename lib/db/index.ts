import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Database Client
 *
 * This module creates and exports a Drizzle database client configured
 * for PostgreSQL. It handles connection pooling and hot-reload caching
 * for development.
 *
 * Usage:
 *   import { db } from "@/lib/db";
 *   const users = await db.query.users.findMany();
 */

// Extend globalThis to cache the database connection in development
// This prevents creating new connections on every hot reload
declare global {
  // eslint-disable-next-line no-var
  var _db: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

// Get database URL from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL environment variable is not set.\n" +
      "Please create a .env.local file with:\n" +
      'DATABASE_URL="postgres://postgres:postgres@localhost:5432/agi"'
  );
}

// Create the postgres.js client
// In development, we disable "prepare" to avoid issues with hot module replacement
const client = postgres(connectionString, {
  prepare: process.env.NODE_ENV === "production",
});

// Create the Drizzle instance with our schema
// This enables the query builder and type inference
const db = drizzle(client, { schema });

// In development, cache the connection on globalThis to reuse across hot reloads
// In production, a new connection is created for each serverless function instance
if (process.env.NODE_ENV !== "production") {
  global._db = db;
}

// Export the database client and all schema exports
export { db };
export * from "./schema";
