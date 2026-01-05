#!/usr/bin/env tsx
/**
 * Database Reset Script
 *
 * This script drops all tables and recreates them from scratch.
 * Use this when syncing database structure across development machines.
 *
 * Usage:
 *   npm run db:reset
 *
 * WARNING: This will DELETE ALL DATA in your database!
 */

import { sql } from "drizzle-orm";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

async function resetDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is required");
    process.exit(1);
  }

  console.log("🔄 Connecting to database...");
  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client);

  try {
    console.log("⚠️  This will DROP ALL TABLES and DATA!");
    console.log("⏳ Starting in 3 seconds... (Press Ctrl+C to cancel)");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log("\n🗑️  Dropping all tables...");

    // Drop tables in correct order (respecting foreign keys)
    await db.execute(sql`DROP TABLE IF EXISTS sessions CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS accounts CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS verifications CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);

    // Drop the migrations table to start fresh
    await db.execute(sql`DROP TABLE IF EXISTS __drizzle_migrations CASCADE`);

    console.log("✅ All tables dropped successfully");
    console.log("\n📋 Next steps:");
    console.log("   1. Run: npm run db:migrate");
    console.log("   2. Your database will be recreated with the latest schema");
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    process.exit(1);
  } finally {
    await client.end();
    console.log("\n✅ Database connection closed");
  }
}

resetDatabase();
