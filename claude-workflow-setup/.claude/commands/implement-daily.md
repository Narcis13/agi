---
description: Start daily implementation workflow from DAILY_PLAN.md. Implements all tasks sequentially with TDD approach.
argument-hint: "[--review] [--dry-run]"
---

# Daily Implementation Workflow

Execute this workflow to implement all tasks from DAILY_PLAN.md.

## Arguments
- `--review`: Run code review after each task (slower but safer)
- `--dry-run`: Only show what would be done, don't implement

## Workflow Steps

### Step 1: Load Plan
Read `DAILY_PLAN.md` completely. Identify:
- Total number of tasks
- Tasks already completed `[x]`
- Tasks blocked `[BLOCKED]`
- Tasks remaining `[ ]`

### Step 2: Environment Check
Verify development environment is ready:
```bash
# Check if on correct branch
git branch --show-current

# Check for uncommitted changes
git status --porcelain

# Install dependencies if needed
bun install

# Run existing tests to ensure baseline is green
bun test
```

If tests fail, stop and report the issue.

### Step 3: Execute Tasks

For each remaining task `[ ]`:

1. **Read** the task specification
2. **Search** for related files: `grep -rn "keyword" src/`
3. **Plan** the implementation approach
4. **Write tests first** (TDD)
5. **Implement** the feature
6. **Run tests**: `bun test`
7. **Run linter**: `bun run lint:fix`
8. **Run typecheck**: `bun run typecheck`
9. **Mark complete** in DAILY_PLAN.md: change `[ ]` to `[x]`
10. **Commit** with conventional commit message

If a HARD STOP is encountered:
- Stop execution
- Output `<promise>CHECKPOINT</promise>`
- Await human verification

If a task fails after 3 attempts:
- Mark as `[BLOCKED: reason]` in DAILY_PLAN.md
- Document in BLOCKED.md
- Continue to next task

### Step 4: Final Summary

After all tasks are processed:
```bash
# Show summary of changes
git log --oneline main..HEAD

# Run full test suite
bun test

# Check coverage
bun test --coverage
```

Output appropriate completion promise:
- `<promise>ALL_DONE</promise>` - All tasks completed
- `<promise>PARTIAL</promise>` - Some tasks remain
- `<promise>NEEDS_HELP</promise>` - >50% tasks blocked

## Safety Checks

Before each commit:
- [ ] Tests pass
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] No secrets in code
- [ ] Changes match task specification

## Recovery

If something goes wrong:
```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all changes
git checkout -- .

# Return to main
git checkout main
```
