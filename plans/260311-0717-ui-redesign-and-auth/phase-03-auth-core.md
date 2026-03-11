# Phase 03: Auth Schema & Core

## Context
- [Research: Auth Solutions](./research/researcher-02-auth-solutions.md)
- [Plan overview](./plan.md)

## Overview
Set up Better Auth with SQLite + Drizzle ORM. Add user/session tables. Implement email+password auth core. No UI yet - just the auth engine and middleware.

## Key Insights (from research)
- Better Auth: native App Router, auto-schema gen, plugin architecture
- Dual auth pattern: session cookie for web, Bearer token for API
- Schema: user, session, api_key tables
- Tasks need `userId` FK for ownership (add later in Phase 05 to avoid breaking existing API)

## Requirements
1. Install Better Auth + dependencies
2. Configure Better Auth with SQLite + Drizzle
3. Create auth schema (user, session, verification tables)
4. Set up auth API route handler
5. Create auth middleware for protected routes
6. Add auth utility functions (getCurrentUser, requireAuth)
7. Generate AUTH_SECRET environment variable

## Architecture

### Auth Flow
```
Browser Request:
  Cookie (session_token) --> Better Auth validates --> req.user set

API Request:
  Authorization: Bearer <api_key> --> custom middleware validates --> req.user set

Both paths --> route handler has authenticated user context
```

### New Files
```
src/lib/auth.ts              -- Better Auth server instance config
src/lib/auth-client.ts       -- Better Auth client instance
src/app/api/auth/[...all]/route.ts  -- Better Auth catch-all route
src/middleware.ts             -- Next.js middleware for route protection
src/db/auth-schema.ts        -- Auth-specific Drizzle schema (user, session)
```

### Modified Files
```
src/db/schema.ts             -- re-export auth-schema for unified access
src/db/index.ts              -- no changes (same db instance)
.env.local                   -- add AUTH_SECRET, AUTH_URL
```

## Related Code Files
- `src/db/schema.ts` - existing tasks + comments schema
- `src/db/index.ts` - database connection
- `src/app/api/tasks/route.ts` - will need auth later (Phase 05)
- `src/lib/api-helpers.ts` - will add auth helpers

## Implementation Steps

### 1. Install dependencies
```bash
npm install better-auth
```

### 2. Generate AUTH_SECRET
```bash
npx auth secret
```
Add to `.env.local`:
```
AUTH_SECRET=<generated>
AUTH_URL=http://localhost:3000
```

### 3. Create auth schema (src/db/auth-schema.ts)
```ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});
```

Note: Better Auth may auto-generate these tables. Check Better Auth docs for `generate` CLI command. The above is the expected schema shape for reference.

### 4. Create Better Auth server config (src/lib/auth.ts)
```ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite" }),
  emailAndPassword: { enabled: true },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh every 24h
  },
});
```

### 5. Create Better Auth client (src/lib/auth-client.ts)
```ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000",
});
```

### 6. Create auth API route (src/app/api/auth/[...all]/route.ts)
```ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

### 7. Create Next.js middleware (src/middleware.ts)
```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes - no auth required
  const publicPaths = ["/login", "/signup", "/api/auth"];
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // API routes: check for session cookie OR Bearer token
  if (pathname.startsWith("/api/")) {
    const authHeader = request.headers.get("authorization");
    const sessionCookie = request.cookies.get("better-auth.session_token");

    if (!authHeader && !sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Web routes: check session cookie, redirect to /login if missing
  const sessionCookie = request.cookies.get("better-auth.session_token");
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

Note: Middleware does lightweight cookie/header presence check. Actual validation happens in route handlers via `auth.api.getSession()`.

### 8. Create auth helper utilities
Add to `src/lib/auth-helpers.ts`:
```ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}
```

### 9. Push schema to database
```bash
npm run db:push
```

### 10. Update .env.local template
Add auth vars to `.env.example` or document in README.

## Todo
- [ ] Install better-auth
- [ ] Generate AUTH_SECRET, add to .env.local
- [ ] Create auth schema (src/db/auth-schema.ts)
- [ ] Create Better Auth server config (src/lib/auth.ts)
- [ ] Create Better Auth client (src/lib/auth-client.ts)
- [ ] Create auth API route handler
- [ ] Create Next.js middleware
- [ ] Create auth helper utilities
- [ ] Push schema to database
- [ ] Test: auth API routes respond (/api/auth/sign-up, /api/auth/sign-in)
- [ ] Test: unauthenticated requests get 401 on /api/tasks
- [ ] Test: session cookie set after sign-in

## Success Criteria
- Better Auth initialized with SQLite + Drizzle
- Sign-up creates user record in database
- Sign-in returns session cookie
- Middleware blocks unauthenticated web requests (redirect to /login)
- Middleware allows requests with valid session cookie or Bearer header
- Auth API endpoints respond correctly
- Existing task API routes still functional (auth validation deferred to Phase 05)

## Risk Assessment
- **Medium:** Better Auth + better-sqlite3 compatibility - test early. Better Auth uses Kysely internally but Drizzle adapter bridges this.
- **Low:** Middleware running on Edge vs Node runtime - Better Auth requires Node. May need `export const runtime = "nodejs"` in route.
- **Low:** Cookie name may differ by Better Auth version - verify actual cookie name.

## Security Considerations
- AUTH_SECRET must be cryptographically random (32+ chars)
- Password hashing handled by Better Auth (argon2 by default)
- Session tokens are httpOnly, secure, sameSite cookies
- CSRF protection built into Better Auth
- Never log or expose session tokens or password hashes

## Next Steps
Phase 04: Build login/signup UI pages using auth client.
