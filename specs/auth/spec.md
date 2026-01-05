# Authentication Specification

## Overview

Implement email/password authentication using Better Auth with routes `/login`, `/logout`, and `/register`. The implementation will use JWT tokens for session management with PostgreSQL as the backing database.

## Technical Stack

- **Auth Library**: Better Auth
- **Database**: PostgreSQL (via Drizzle ORM)
- **Session Management**: JWT tokens with automatic silent refresh
- **UI Components**: Base-UI components (shadcn base-maia style)
- **Styling**: Tailwind CSS 4

## Core Features

### Authentication Routes

1. **`/login`** - User login page
2. **`/register`** - New user registration page
3. **`/logout`** - Logout endpoint (API route)

### Registration Flow

**Required Fields:**
- Email (validated format)
- Password (min 8 chars, max 128 chars)
- Name/Display name
- Terms of Service acceptance checkbox

**Validation:**
- Email format validation on blur
- Password length validation (8-128 characters) on blur
- Terms must be accepted to submit
- Show specific error if email already exists: "Email already registered"

**User Experience:**
- Separate dedicated `/register` page
- Loading spinner on submit button during registration
- No navigation warnings for partially filled forms
- Minimal page design with welcome message and basic branding

### Login Flow

**Required Fields:**
- Email
- Password
- Remember Me checkbox (extends session from 7 days to 30 days)

**Security:**
- Rate limiting on failed attempts
- Show CAPTCHA after multiple failures
- Generic error message for invalid credentials
- Protect against brute force attacks

**User Experience:**
- Separate dedicated `/login` page
- Loading spinner on submit button during authentication
- Keyboard navigation support throughout form
- Minimal page design with welcome message and basic branding

### Session Management

**JWT Configuration:**
- Access token expiration: 15 minutes
- Refresh token expiration: 7 days (default) or 30 days (with Remember Me)
- Automatic silent refresh using refresh token
- Tokens stored in HTTP-only cookies

**Cookie Settings:**
- `httpOnly: true` - Prevent JavaScript access
- `secure: true` - HTTPS only in production
- `sameSite: 'lax'` - CSRF protection with normal navigation support

**Multi-tab Handling:**
- Use BroadcastChannel API to sync logout across all browser tabs
- When user logs out in one tab, all other tabs are automatically logged out

### Logout Flow

**Actions:**
- Clear JWT cookies from browser
- Redirect to `/login` page
- Broadcast logout event to other tabs via BroadcastChannel

## Database Schema

### Users Table

Required fields:
```typescript
{
  id: string (primary key)
  email: string (unique, indexed)
  name: string
  passwordHash: string
  createdAt: timestamp
  updatedAt: timestamp
  lastLoginAt: timestamp
}
```

Schema designed to support future OAuth providers (Google, GitHub, etc.) with minimal refactoring.

## Routing & Protection

### Middleware Configuration

**Protected Routes:**
- Middleware-based route protection using Next.js middleware
- Unauthenticated users redirected to `/login`
- Store originally requested URL for post-login redirect

**Auth Page Redirects:**
- Authenticated users accessing `/login` or `/register` are redirected to `/dashboard`

**Post-Login Redirect:**
- Default: `/dashboard`
- Fallback: Return to originally requested page if coming from protected route redirect

### API Route Protection

- Create reusable auth middleware for API routes
- Validate JWT on all protected API endpoints
- Return 401 Unauthorized for invalid/missing tokens

## Configuration

### File Structure

**Auth Configuration:**
- `lib/auth.ts` - Centralized Better Auth configuration

**API Routes:**
- `app/api/auth/[...all]/route.ts` - Better Auth catch-all handler

**Client State:**
- Use Better Auth's built-in React hooks for session management

### Environment Variables

Required environment variables:
```bash
AUTH_SECRET=<random-secret-for-jwt-signing>
DATABASE_URL=<postgresql-connection-string>
APP_URL=<base-application-url>
NODE_ENV=<development|production>
```

## Security

### CSRF Protection
- Rely on Better Auth's built-in CSRF protection
- SameSite cookie attribute provides additional protection

### Rate Limiting
- Implement rate limiting on login attempts
- Track by IP address and email
- Show CAPTCHA after configurable number of failures (e.g., 5 attempts)

### Password Security
- Minimum length: 8 characters
- Maximum length: 128 characters (prevent DoS)
- Validation on blur, not real-time typing
- Error messages shown below form fields

### Token Security
- Short-lived access tokens (15 min) minimize exposure
- Refresh tokens enable seamless UX
- HTTP-only cookies prevent XSS attacks
- Secure flag ensures HTTPS-only transmission in production

## User Experience

### Loading States
- Show loading spinners on submit buttons during async operations
- Disable form inputs while request is in progress
- Clear visual feedback for all auth actions

### Error Handling
- Display specific error messages for duplicate emails
- Generic "Invalid credentials" for failed login attempts
- Form field validation errors shown below respective fields
- Console logging for error tracking during development

### Accessibility
- Full keyboard navigation support
- Logical tab order through form fields
- Clear focus indicators on all interactive elements
- Proper form labels and button text

### Form Layout
- Clean, minimal design
- Welcome message and basic branding (logo/app name)
- Prominent links to switch between login and register pages
- Mobile-responsive design using Tailwind CSS

## Future Considerations

### Phase 2 Features (not in initial implementation)
- Password reset/forgot password flow
- Email verification for registrations

### Extensibility
- Database schema designed to accommodate OAuth providers
- UI components structured to add social login buttons later
- No refactoring needed for future authentication methods

## Testing Strategy

- Manual testing during development
- Test all core flows: register → login → protected route → logout
- Verify rate limiting behavior
- Test Remember Me functionality
- Verify multi-tab logout synchronization

## Error Logging & Monitoring

- Console logging for development
- Log all authentication failures
- Track registration errors
- Monitor rate limiting triggers
- Structured for future external monitoring integration (Sentry, etc.)

## Implementation Checklist

1. Configure Better Auth in `lib/auth.ts`
2. Set up PostgreSQL user schema with Drizzle
3. Create API route handler at `app/api/auth/[...all]/route.ts`
4. Build `/register` page with form validation
5. Build `/login` page with Remember Me option
6. Implement Next.js middleware for route protection
7. Create auth middleware for API route protection
8. Set up client-side auth hooks
9. Implement multi-tab logout synchronization
10. Add rate limiting to login endpoint
11. Configure environment variables
12. Test all authentication flows manually

## Success Criteria

- Users can successfully register with email/password
- Registered users can log in and access protected routes
- JWT tokens refresh automatically before expiration
- Rate limiting prevents brute force attacks
- Remember Me extends session appropriately
- Logout clears session across all browser tabs
- Authenticated users cannot access auth pages
- Keyboard navigation works throughout all forms
- All error states display appropriate messages
