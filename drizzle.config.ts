import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit Configuration
 *
 * This file configures drizzle-kit, the CLI tool for database operations:
 *
 * Commands (run these with npm):
 * - npm run db:push     - Push schema directly to database (dev only)
 * - npm run db:generate - Generate migration files from schema changes
 * - npm run db:migrate  - Apply pending migrations to database
 * - npm run db:studio   - Open Drizzle Studio (visual database browser)
 *
 * Workflow:
 * 1. Edit lib/db/schema.ts with your changes
 * 2. Run "npm run db:push" for quick development iteration
 *    OR
 *    Run "npm run db:generate" then "npm run db:migrate" for production
 */

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

export default defineConfig({
  // Path to your schema file(s)
  schema: "./lib/db/schema.ts",

  // Output directory for migration files
  out: "./drizzle",

  // Database dialect
  dialect: "postgresql",

  // Database connection
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },

  // Enable verbose logging during migrations
  verbose: true,

  // Strict mode catches potential issues early
  strict: true,
});
