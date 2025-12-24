import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

/**
 * Users Table
 *
 * This schema is designed to be compatible with better-auth.
 * When you add better-auth later, it will use this existing table.
 *
 * Fields:
 * - id: Primary key (text for UUID compatibility with better-auth)
 * - name: User's display name
 * - email: Unique email address for authentication
 * - emailVerified: Whether the user has verified their email
 * - image: Optional profile picture URL
 * - createdAt: Timestamp when the user was created
 * - updatedAt: Timestamp when the user was last modified
 */
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// TypeScript types inferred from the schema
// Use these when working with user data in your application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
