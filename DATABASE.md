# Database Management

This project uses Drizzle ORM with PostgreSQL for database management.

## Prerequisites

- PostgreSQL database running (local or remote)
- `DATABASE_URL` environment variable set in `.env` file

## Database Commands

```bash
# Generate migration files from schema changes
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Push schema directly to database (dev only - bypasses migrations)
npm run db:push

# Open Drizzle Studio (visual database browser)
npm run db:studio

# Reset database (drops all tables and data)
npm run db:reset
```

## Setting Up on a New Development Machine

When you clone this repository on a new machine or need to sync with the latest schema:

### Option 1: Fresh Start (Recommended for development)

```bash
# 1. Clone the repository
git clone <repository-url>
cd agi

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Create .env file with DATABASE_URL
echo "DATABASE_URL=postgresql://user:password@localhost:5432/dbname" > .env

# 4. Reset database (if you have an old/broken schema)
npm run db:reset

# 5. Apply all migrations
npm run db:migrate

# 6. Verify setup with Drizzle Studio
npm run db:studio
```

### Option 2: Apply New Migrations (For existing databases)

If you already have a database and just need to apply new migrations:

```bash
# 1. Pull latest code
git pull

# 2. Install any new dependencies
npm install

# 3. Apply pending migrations
npm run db:migrate
```

## Development Workflow

### Making Schema Changes

1. **Edit the schema** in `lib/db/schema.ts`

2. **Generate migration**:
   ```bash
   npm run db:generate
   ```

3. **Review the generated SQL** in `drizzle/XXXX_*.sql`

4. **Apply the migration**:
   ```bash
   npm run db:migrate
   ```

5. **Commit both schema and migration files**:
   ```bash
   git add lib/db/schema.ts drizzle/
   git commit -m "Add new table/field"
   git push
   ```

### Quick Development Iteration

For rapid development without creating migrations:

```bash
npm run db:push
```

**Warning**: This bypasses migrations and directly syncs your schema. Only use during active development.

## Troubleshooting

### "Migration already applied" errors

If you get errors about migrations being out of sync:

```bash
npm run db:reset
npm run db:migrate
```

### Broken or Inconsistent Schema

If your database has tables that don't match the schema:

```bash
# This will drop everything and start fresh
npm run db:reset
npm run db:migrate
```

### Checking Current Database State

Use Drizzle Studio to visually inspect your database:

```bash
npm run db:studio
```

Then open your browser to the URL shown (usually http://localhost:4983).

## Production Deployment

**Never use `db:reset` or `db:push` in production!**

For production deployments:

1. **Review migrations** carefully before deploying
2. **Backup your database**
3. **Run migrations** as part of your deployment process:
   ```bash
   npm run db:migrate
   ```

## Schema Overview

Current tables:
- `users` - User accounts
- `accounts` - OAuth provider accounts (Better Auth)
- `sessions` - User sessions (Better Auth)
- `verifications` - Email verification tokens (Better Auth)

See `lib/db/schema.ts` for detailed schema documentation.
