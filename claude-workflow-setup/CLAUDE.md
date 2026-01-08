# CLAUDE.md - Project Instructions for Claude Code

## Project Overview

This project uses an autonomous development workflow where Claude Code works on tasks defined in `DAILY_PLAN.md` using the Ralph Wiggum loop technique.

**Tech Stack:**
- Runtime: Bun.js
- Frontend: React with TypeScript
- Backend: Hono.js
- Database: (specify your DB)
- Testing: Vitest
- Styling: Tailwind CSS

## Working Mode

You are operating in **autonomous mode**. This means:
1. You work through tasks without human supervision
2. You make decisions and implement features independently
3. You commit changes after each successful task
4. You document blockers when you can't proceed

## File Structure

```
project/
├── src/
│   ├── components/     # React components
│   ├── routes/         # Hono API routes
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript types
│   └── lib/            # Shared libraries
├── tests/              # Test files
├── DAILY_PLAN.md       # Today's tasks (READ THIS FIRST)
├── BLOCKED.md          # Documented blockers
└── CLAUDE.md           # This file
```

## Coding Conventions

### TypeScript
- Use strict TypeScript (`strict: true`)
- Prefer `type` over `interface` for object types
- Use Zod for runtime validation
- Export types from dedicated `.types.ts` files

```typescript
// ✅ Good
type User = {
  id: string;
  email: string;
  createdAt: Date;
};

// ✅ Good - Zod schema with inferred type
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  createdAt: z.date(),
});
type User = z.infer<typeof UserSchema>;

// ❌ Bad - any type
const data: any = fetchData();
```

### React Components
- Use functional components with hooks
- Prefer named exports
- Keep components small and focused
- Use React Query for data fetching

```typescript
// ✅ Good
export function UserCard({ user }: { user: User }) {
  return (
    <div className="p-4 rounded-lg bg-white shadow">
      <h3 className="font-bold">{user.name}</h3>
    </div>
  );
}

// ❌ Bad - default export, class component
export default class UserCard extends Component { ... }
```

### API Routes (Hono)
- Use RESTful conventions
- Validate all inputs with Zod
- Return consistent response shapes
- Handle errors gracefully

```typescript
// ✅ Good
app.post('/api/users', zValidator('json', CreateUserSchema), async (c) => {
  const data = c.req.valid('json');
  const user = await createUser(data);
  return c.json({ success: true, data: user });
});
```

### File Naming
- Components: `PascalCase.tsx` (e.g., `UserCard.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Types: `*.types.ts` (e.g., `user.types.ts`)
- Tests: `*.test.ts` (e.g., `UserCard.test.tsx`)

### Git Commits
Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code refactoring
- `test:` Adding tests
- `docs:` Documentation
- `chore:` Maintenance

```bash
# ✅ Good
git commit -m "feat(auth): add password reset endpoint"
git commit -m "fix(ui): correct button alignment on mobile"

# ❌ Bad
git commit -m "updates"
git commit -m "fixed stuff"
```

## Testing Requirements

### Before marking a task complete:
1. Write unit tests for new functions
2. Write integration tests for API endpoints
3. Run `bun test` and ensure all pass
4. Check for TypeScript errors with `bun run typecheck`

### Test Structure
```typescript
import { describe, it, expect } from 'vitest';

describe('UserService', () => {
  describe('createUser', () => {
    it('should create a user with valid data', async () => {
      const user = await createUser({ email: 'test@example.com' });
      expect(user.id).toBeDefined();
    });

    it('should throw on invalid email', async () => {
      await expect(createUser({ email: 'invalid' }))
        .rejects.toThrow('Invalid email');
    });
  });
});
```

## Task Execution Protocol

### When starting a task:
1. Read the task description in DAILY_PLAN.md
2. Identify related files by searching the codebase
3. Understand existing patterns before writing code
4. Plan your implementation approach

### When implementing:
1. Start with the simplest working solution
2. Add proper error handling
3. Include input validation
4. Write clear, self-documenting code

### When completing a task:
1. Run tests: `bun test`
2. Run linter: `bun run lint`
3. Run typecheck: `bun run typecheck`
4. Mark task as `[x]` in DAILY_PLAN.md
5. Commit with descriptive message

### When blocked:
1. Document the blocker in BLOCKED.md with:
   - Task reference
   - What you tried
   - Why it failed
   - What information/access you need
2. Mark task as `[BLOCKED: brief reason]` in DAILY_PLAN.md
3. Continue to next task

## Safety Rules

### NEVER:
- Modify `.env` or environment files
- Delete or overwrite existing data without backup
- Force push to any branch
- Modify files outside the project directory
- Execute commands with `sudo`
- Install packages globally without explicit approval
- Make direct changes to `main` branch

### ALWAYS:
- Work on the designated branch
- Validate inputs before processing
- Handle errors gracefully
- Log important operations
- Write tests before marking complete
- Keep commits atomic and focused

## Available Commands

```bash
# Development
bun dev              # Start dev server
bun build            # Build for production
bun test             # Run tests
bun run lint         # Run ESLint
bun run lint:fix     # Fix linting issues
bun run typecheck    # TypeScript check

# Database (if applicable)
bun db:migrate       # Run migrations
bun db:seed          # Seed database
bun db:studio        # Open DB studio
```

## Emergency Contacts

If you encounter critical issues that require human intervention:
1. Stop working on the current task
2. Document thoroughly in BLOCKED.md
3. Output `<promise>NEEDS_HELP</promise>` to end the session
4. The human will review when they return

---

Remember: You are autonomous but not unsupervised. All your work will be reviewed. Quality over speed.
