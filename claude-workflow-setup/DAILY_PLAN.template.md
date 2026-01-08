# Daily Plan - [DATE]

> **Instructions for Claude:** Read this file completely before starting. Execute tasks in order.
> Mark completed tasks with `[x]`. Mark blocked tasks with `[BLOCKED: reason]`.

## Context

Brief description of what we're building today and any important context.

**Branch:** `claude-work`
**Related Issues:** #123, #124 (if applicable)

---

## Tasks

### Priority 1: Critical

- [ ] **Task 1 Title**
  - Description: What needs to be done
  - Files: `src/path/to/file.ts`
  - Acceptance: How to verify it's complete

- [ ] **Task 2 Title**
  - Description: What needs to be done
  - Files: `src/path/to/file.ts`
  - Acceptance: How to verify it's complete

### Priority 2: Important

- [ ] **Task 3 Title**
  - Description: What needs to be done
  - Files: `src/path/to/file.ts`
  - Acceptance: How to verify it's complete

### Priority 3: Nice to Have

- [ ] **Task 4 Title** *(optional)*
  - Description: What needs to be done
  - Acceptance: How to verify it's complete

---

## Constraints

- List any constraints or limitations
- Things NOT to modify
- External dependencies to be aware of

## Resources

- Link to design: [Figma/URL]
- API docs: [URL]
- Related PR: #000

## HARD STOPS

> Tasks marked with **HARD STOP** require human verification before proceeding.
> Output `<promise>CHECKPOINT</promise>` when you reach one.

- [ ] **HARD STOP** - Verify [something] before continuing to next section

---

## Success Criteria

All tasks must meet these criteria before marking complete:
- [ ] All tests pass (`bun test`)
- [ ] No TypeScript errors (`bun run typecheck`)
- [ ] No linting errors (`bun run lint`)
- [ ] Code follows project conventions
- [ ] Changes are committed with proper messages

## End of Day

When all tasks are complete or blocked:
- Output `<promise>ALL_DONE</promise>` if all tasks completed
- Output `<promise>NEEDS_HELP</promise>` if >50% tasks blocked
- Output `<promise>PARTIAL</promise>` if some tasks remain

---

*Last updated: [DATE] by [human/Claude]*
