# Phase 04: Auth UI

## Context
- [Phase 03: Auth Core](./phase-03-auth-core.md) (prerequisite)
- [Plan overview](./plan.md)

## Overview
Build login and signup pages, user menu in header, protected route handling, and session-aware components. Uses Better Auth client SDK + existing shadcn/ui components.

## Requirements
1. Login page (`/login`) with email + password form
2. Signup page (`/signup`) with name + email + password form
3. User menu in board header (avatar/initials, name, logout)
4. Redirect unauthenticated users to /login
5. Redirect authenticated users away from /login and /signup
6. Loading states during auth operations

## Architecture

### New Files
```
src/app/(auth)/login/page.tsx       -- login form page
src/app/(auth)/signup/page.tsx      -- signup form page
src/app/(auth)/layout.tsx           -- centered auth layout (no board chrome)
src/components/auth/login-form.tsx  -- login form component
src/components/auth/signup-form.tsx -- signup form component
src/components/auth/user-menu.tsx   -- header user dropdown
```

### Modified Files
```
src/components/board/board-header.tsx  -- add UserMenu component
src/app/page.tsx                       -- remains board page (protected by middleware)
```

### Route Structure
```
/login          -- public, auth layout
/signup         -- public, auth layout
/               -- protected, board layout (existing)
/api/auth/*     -- Better Auth routes (public)
/api/tasks/*    -- protected (middleware)
```

## Related Code Files
- `src/lib/auth-client.ts` - Better Auth client (from Phase 03)
- `src/components/board/board-header.tsx` - needs user menu
- `src/app/layout.tsx` - root layout
- `src/middleware.ts` - route protection (from Phase 03)

## Implementation Steps

### 1. Create auth route group layout (src/app/(auth)/layout.tsx)
- Centered layout: `flex items-center justify-center min-h-screen bg-muted/30`
- Card wrapper: max-w-md, centered
- No board header/chrome
- Dark mode support (ThemeProvider already in root layout from Phase 01)

### 2. Create login form (src/components/auth/login-form.tsx)
- shadcn Card with CardHeader ("Sign in to Vibe Kanban") + CardContent
- Email input (type="email", required)
- Password input (type="password", required)
- Submit button ("Sign in") with loading state
- Link to /signup ("Don't have an account? Sign up")
- Error display for failed login
- Use `authClient.signIn.email()` from Better Auth client
- On success: `router.push("/")`

### 3. Create signup form (src/components/auth/signup-form.tsx)
- Card with "Create your account" header
- Name input (required)
- Email input (type="email", required)
- Password input (type="password", required, minLength 8)
- Submit button ("Create account") with loading state
- Link to /login ("Already have an account? Sign in")
- Error display for failed signup (duplicate email, weak password)
- Use `authClient.signUp.email()` from Better Auth client
- On success: `router.push("/")`

### 4. Create login page (src/app/(auth)/login/page.tsx)
```tsx
import { LoginForm } from "@/components/auth/login-form";
export default function LoginPage() {
  return <LoginForm />;
}
```

### 5. Create signup page (src/app/(auth)/signup/page.tsx)
```tsx
import { SignupForm } from "@/components/auth/signup-form";
export default function SignupPage() {
  return <SignupForm />;
}
```

### 6. Create user menu (src/components/auth/user-menu.tsx)
- Dropdown trigger: user initials in circle (or avatar if image exists)
- Dropdown content:
  - User name + email (display only, muted)
  - Separator
  - "API Keys" link (placeholder for Phase 05)
  - Separator
  - "Sign out" button
- Sign out: `authClient.signOut()` then `router.push("/login")`
- Use shadcn DropdownMenu component (add if not installed)

### 7. Add UserMenu to board-header.tsx
- Import UserMenu, place in header right section (after New Task button)
- Pass user session data (fetch via `authClient.useSession()`)

### 8. Add shadcn components if missing
```bash
npx shadcn@latest add dropdown-menu avatar separator
```

### 9. Handle authenticated redirect on auth pages
- In login/signup forms, check `authClient.useSession()` - if logged in, redirect to "/"
- Prevents logged-in users from seeing login page

## Todo
- [ ] Add shadcn dropdown-menu, avatar, separator components
- [ ] Create auth layout (src/app/(auth)/layout.tsx)
- [ ] Create login form component
- [ ] Create signup form component
- [ ] Create login page
- [ ] Create signup page
- [ ] Create user menu component
- [ ] Add UserMenu to board-header.tsx
- [ ] Handle auth redirects (logged-in users away from /login)
- [ ] Test: signup flow creates user and redirects to board
- [ ] Test: login flow authenticates and redirects to board
- [ ] Test: logout clears session and redirects to /login
- [ ] Test: unauthenticated access to / redirects to /login
- [ ] Test: all forms in light and dark mode

## Success Criteria
- Users can sign up with name/email/password
- Users can sign in and see the board
- User menu shows name/initials and allows logout
- Auth pages are centered, clean, and match board design
- Invalid credentials show clear error messages
- All auth flows work in both light and dark mode

## Risk Assessment
- **Low:** Better Auth client `useSession()` hook may need wrapping in client component boundary
- **Low:** Redirect loops if middleware and client-side redirects conflict - test carefully
- **Medium:** Better Auth session cookie name must match middleware check (Phase 03)

## Security Considerations
- Password min length: 8 characters (enforce client + server side)
- No password in URL params
- CSRF handled by Better Auth
- Rate limiting on auth endpoints (Better Auth built-in or add custom)
- Error messages should not reveal whether email exists (use generic "Invalid credentials")

## Next Steps
Phase 05: API key management for agent auth.
