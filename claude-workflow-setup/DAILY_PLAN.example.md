# Daily Plan - 8 Ianuarie 2026

> **Instructions for Claude:** Read this file completely before starting. Execute tasks in order.
> Mark completed tasks with `[x]`. Mark blocked tasks with `[BLOCKED: reason]`.

## Context

Building the password reset flow for PostNow authentication system. Users should be able to request a password reset via email and set a new password using a secure token.

**Branch:** `claude-work`
**Related Issues:** #42 Password Reset Feature

---

## Tasks

### Priority 1: Backend API

- [ ] **Create password reset request endpoint**
  - Description: Create `POST /api/auth/forgot-password` that accepts email, validates it exists, generates a secure token, stores it in DB, and triggers email
  - Files: `src/routes/auth.ts`, `src/lib/email.ts`
  - Acceptance: 
    - Returns 200 for valid emails (even if not found, for security)
    - Generates cryptographically secure token (32 bytes, hex)
    - Stores token with 1-hour expiry in database

- [ ] **Create password reset token table**
  - Description: Add database migration for `password_reset_tokens` table with columns: id, user_id, token (hashed), expires_at, used_at, created_at
  - Files: `src/db/migrations/`, `src/db/schema.ts`
  - Acceptance:
    - Migration runs without errors
    - Table created with proper indexes on token and user_id

- [ ] **Add rate limiting to reset endpoint**
  - Description: Limit password reset requests to 3 per hour per IP address
  - Files: `src/middleware/rateLimit.ts`, `src/routes/auth.ts`
  - Acceptance:
    - 4th request within an hour returns 429
    - Rate limit resets after 1 hour
    - Write test for rate limiting

- [ ] **Create password reset confirmation endpoint**
  - Description: Create `POST /api/auth/reset-password` that accepts token and new password, validates token, updates password, invalidates token
  - Files: `src/routes/auth.ts`
  - Acceptance:
    - Invalid/expired tokens return 400
    - Password updated and hashed correctly
    - Token marked as used after successful reset
    - Returns success message

### Priority 2: Email Integration

- [ ] **Create password reset email template**
  - Description: Create HTML email template using Resend with reset link, styled to match PostNow brand
  - Files: `src/emails/password-reset.tsx`
  - Acceptance:
    - Email renders correctly
    - Contains reset link with token
    - Link expires info visible
    - Mobile-friendly

- [ ] **Send reset email function**
  - Description: Implement sendPasswordResetEmail function using Resend SDK
  - Files: `src/lib/email.ts`
  - Acceptance:
    - Email sent successfully via Resend
    - Proper error handling if sending fails
    - Logs email sending attempts

### Priority 3: Frontend

- [ ] **HARD STOP** - Review backend implementation before frontend
  - Verify all API endpoints work correctly via manual testing or tests
  - Check email sending works
  - Confirm before proceeding

- [ ] **Create ForgotPassword page**
  - Description: Create `/forgot-password` page with email input form
  - Files: `src/pages/ForgotPassword.tsx`
  - Acceptance:
    - Form validates email format
    - Shows loading state during submission
    - Shows success message (same for all emails, security)
    - Link to go back to login

- [ ] **Create ResetPassword page**
  - Description: Create `/reset-password` page that reads token from URL and allows setting new password
  - Files: `src/pages/ResetPassword.tsx`
  - Acceptance:
    - Validates token on page load
    - Shows error for invalid/expired tokens
    - Password confirmation field
    - Password strength indicator
    - Redirects to login on success

### Priority 4: Testing

- [ ] **Write integration tests for reset flow**
  - Description: E2E tests for complete password reset flow
  - Files: `tests/auth/password-reset.test.ts`
  - Acceptance:
    - Test successful reset flow
    - Test invalid email handling
    - Test expired token handling
    - Test rate limiting
    - All tests pass

---

## Constraints

- **DO NOT** modify existing `users` table schema
- **DO NOT** change existing auth endpoints behavior
- Use Resend for email (already configured in `.env`)
- Tokens must be crypto-random using `crypto.randomBytes(32)`
- Hash tokens before storing (use same hashing as passwords)
- Reset links format: `https://app.postnow.com/reset-password?token=xxx`

## Resources

- Resend docs: https://resend.com/docs
- Existing auth code: `src/routes/auth.ts`
- Email config: `src/lib/email.ts`

## Environment Variables Needed

Already configured (do not modify):
- `RESEND_API_KEY` - Resend API key
- `APP_URL` - Base URL for links

---

## Success Criteria

All tasks must meet these criteria before marking complete:
- [ ] All tests pass (`bun test`)
- [ ] No TypeScript errors (`bun run typecheck`)
- [ ] No linting errors (`bun run lint`)
- [ ] Code follows project conventions in CLAUDE.md
- [ ] Each feature committed separately

## End of Day Outputs

- `<promise>ALL_DONE</promise>` - All tasks completed
- `<promise>CHECKPOINT</promise>` - Reached HARD STOP, awaiting review
- `<promise>NEEDS_HELP</promise>` - More than 50% tasks blocked
- `<promise>PARTIAL</promise>` - Some tasks done, some remain

---

*Last updated: 8 Jan 2026 by Narcis*
