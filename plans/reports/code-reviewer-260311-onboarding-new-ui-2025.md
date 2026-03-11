# Code Review Report: onboarding-new-ui-2025

**Date:** 2026-03-11
**Reviewer:** code-reviewer agent
**Target:** `/Users/nguyennghia/mylavni/onboarding-new-ui-2025`

---

## Code Review Summary

### Scope
- Files reviewed: ~50 source files across frontend (Next.js) and backend (Express)
- Lines of code analyzed: ~6,655 frontend app lines + ~2,000+ backend lines
- Review focus: Full codebase — architecture, security, quality, performance

### Overall Assessment

A functional multi-step onboarding flow for a mental health platform (Lavni). Uses solid tech choices (Next.js 15, Zustand, Zod, shadcn/ui, Express + Mongoose). However, the codebase has **multiple critical security issues** — most urgently, real credentials committed to git. Several components are massively oversized, type safety is weak throughout, and the abandoned form tracking service has a production-critical design flaw.

---

## Critical Issues

### 1. REAL CREDENTIALS IN COMMITTED `.env` FILE
**File:** `/Users/nguyennghia/mylavni/onboarding-new-ui-2025/backend/.env`

The backend `.env` file is tracked in git (confirmed via `git ls-files`) and contains:
- Live JWT secret (512-bit hex string)
- `CLAIM_MD_ACCOUNT_KEY="18420_X07Qzhib2EmpXA42arGNCR6e"` — a real third-party API key for insurance eligibility (Claim.MD)
- `PROVIDER_NPI=1215673256` — a real provider NPI number
- Multiple live Slack webhook URLs

**Action required immediately:**
1. Rotate ALL credentials (JWT secret, Claim.MD key, Slack webhooks)
2. Add `backend/.env` to `.gitignore`
3. Purge from git history: `git filter-branch` or `git filter-repo`
4. Add `.env.example` with placeholder values

### 2. Hardcoded Slack Webhook in `bitbucket-pipelines.yml`
**File:** `/Users/nguyennghia/mylavni/onboarding-new-ui-2025/bitbucket-pipelines.yml` (lines 13, 15, 28, 30)

Live Slack webhook URL (`https://hooks.slack.com/services/T027ED4UF7A/B0A3NQ3Q5NW/...`) is hardcoded in the CI config — publicly visible to anyone with repo access. Move to Bitbucket repository secrets.

### 3. Hardcoded Production API URLs in Frontend
**Files:** `app/login/page.tsx` (lines 40, 75), `app/confirmation/page.tsx` (line 231)

Direct calls to `https://api.lavnihealth.com/api/public/login` bypass the proxy and expose the production API directly from the browser. Should route through the backend proxy.

### 4. JWT Default Secret Fallback
**File:** `backend/src/config/environment.ts` (line 16)
```ts
jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
```
If `JWT_SECRET` env var is missing, the app silently uses a weak default. Should throw on startup instead:
```ts
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
```

### 5. Wildcard CORS in Production
**File:** `backend/src/app.ts` (line 37)
```ts
origin: true, // allows ANY origin
```
This effectively disables CORS protection. The correct origin list is even commented out directly above. Fix: use the allowed origins list.

---

## High Priority Findings

### 6. Sensitive Routes Without Authentication
The following backend routes have no `authenticate` middleware:
- `POST /api/eligibility/check` — submits PHI (name, DOB, member ID) to Claim.MD
- `POST /api/insurance/primary` — saves insurance records by userId
- `POST /api/insurance/secondary`
- `GET /api/insurance/user/:userId` — retrieves user insurance data
- `DELETE /api/insurance/user/:userId`
- `POST /api/create-insurance`

Any unauthenticated caller can access or manipulate insurance/eligibility data for any userId. HIPAA implications.

### 7. In-Memory Abandoned Form Store — Not Production Safe
**File:** `backend/src/services/abandonedFormTracking.service.ts`

All abandoned form data lives in a `Map` in process memory. On every restart/deploy, all data is lost. With a cron interval of 30s and timeout of 10s (from `.env`), the service will aggressively fire Slack notifications during normal development. Move to MongoDB or Redis for persistence.

### 8. Giant Page Components (God Components)
- `app/registration-adult/page.tsx` — **1,308 lines**, 13 hooks, 4+ async API calls
- `app/confirmation/page.tsx` — **823 lines** with multiple eligibility check flows
- `app/verification/page.tsx` — 542 lines including insurance creation logic

These pages mix data fetching, business logic, and rendering. Each API call in `verification/page.tsx` and `confirmation/page.tsx` is reimplemented rather than shared. Extract to custom hooks and service modules.

### 9. Double Insurance Eligibility Check
`verification/page.tsx` runs `checkInsuranceEligibility()` on phone verification success. `confirmation/page.tsx` can re-run it again. This results in double Claim.MD API calls and double MongoDB inserts to `eligibilityResults`. The `verification/page.tsx` already sets `eligibilityResult` in store — `confirmation/page.tsx` should just read it.

### 10. `morgan('dev')` in Production
**File:** `backend/src/app.ts` (line 41)

`morgan('dev')` is hardcoded regardless of `NODE_ENV`. Dev format logs verbose colored output. In production this floods logs and potentially logs request bodies. Use:
```ts
app.use(morgan(config.environment === 'production' ? 'combined' : 'dev'));
```

### 11. Proxy Rate Limiting Disabled
**File:** `backend/src/app.ts` (lines 52–54)

```ts
skip: (req) => req.path.startsWith('/api/lavni-proxy')
```

The Lavni proxy route (which can hit any endpoint on `api.lavnihealth.com`) has no rate limiting. This is an open relay. Add per-IP rate limiting specifically on the proxy.

### 12. Duplicate Next.js Config Files
Both `next.config.js` and `next.config.mjs` exist. Next.js picks one — the other is silently ignored. `next.config.js` disables TypeScript error checking AND ESLint during builds (`ignoreBuildErrors: true`, `ignoreDuringBuilds: true`), masking real errors. `next.config.mjs` has the correct rewrite rules. Consolidate into one file and remove the `ignore*` flags.

---

## Medium Priority Improvements

### 13. Widespread `any` Typing
- `lib/store/types.ts`: `insuranceObject: any`, `minorRegistrationPrefill: any | null`, `AuthState.currentUser: any`, `UserData.[key: string]: any`, `RegisteredUser.[key: string]: any`
- `lib/api.ts`: `workingHours?: any[]`, `blockedDates?: any[]`, `appointments?: any[]`
- Many page components use `useState<any>(null)` for therapist, appointment, userData

Define proper interfaces for these shapes — they're known from the API contracts.

### 14. Vietnamese Comments in Codebase
**Files:** `lib/api.ts` (lines 37, 165–166), `app/page.tsx` (line 12)

Comments in Vietnamese (`// Dữ liệu mẫu...`, `// Trả về dữ liệu mẫu...`) will confuse non-Vietnamese developers. Standardize to English.

### 15. Mock Data as Production Fallback in `lib/api.ts`
**File:** `lib/api.ts` (lines 38–90, 155–156, 166–168)

When the therapist API fails, the app silently returns fake mock therapists without any user notification. Users could book fake therapists. Either show a clear error state or throw — don't silently substitute fabricated data.

### 16. `useEffect` Missing Dependencies
**File:** `app/verification/page.tsx` (line 61)

`useEffect` depends on `storeRegisteredUser` and `storeUserData` but the dependency array only contains `[router]`. The `handleAutoVerifyGoogle` function is also called inside the effect but not declared before it at that point.

### 17. `alert()` Used for Validation
**File:** `app/page.tsx` (lines 99, 106)

Native `alert()` is used for validation errors instead of the already-available `sonner` toast library. Inconsistent UX.

### 18. `console.log` Left in Production Code
All app pages have debug `console.log` calls (8 of 10 app files). Examples: API URLs, user IDs, registration data. These should be removed or gated behind a debug flag. The `lib/api.ts` file logs the full therapist API URL including filter params on every call.

### 19. `password` Field Partially Excluded from Zustand Persistence
**File:** `lib/store/onboarding-store.ts` (lines 141–145)

The password is correctly excluded from `localStorage` persistence via `partialize`. However, the in-memory `setPassword()` action still stores it in Zustand state for the session lifetime. Avoid storing plain-text passwords in state at all — pass directly to the API call and discard.

### 20. `localStorage` Bypass of Zustand
**File:** `lib/api.ts` (lines 130–135), `components/insurance-update-form.tsx` (lines 36–38)

`priorityNumberType` is read from `localStorage` directly in the API layer rather than from the Zustand store, and `selectedState` is independently written to `localStorage` by `insurance-update-form.tsx`. This creates two sources of truth and sync bugs.

---

## Low Priority Suggestions

### 21. Two Lock Files (pnpm + npm)
Both `pnpm-lock.yaml` and `package-lock.json` exist in the root. Pick one package manager and delete the other's lock file. Mixed lock files cause CI inconsistencies.

### 22. `next` Version `^16.1.6` Doesn't Exist
**File:** `package.json` (line 46)

Next.js latest stable is 15.x. Version `^16.1.6` will fail `npm install` or resolve to a non-existent version. Check and correct.

### 23. `moment` + `date-fns` Both Present
Both `moment` (heavy, ~300KB) and `date-fns` are listed as dependencies. Pick one. `date-fns` is the modern choice.

### 24. `ecosystem.config.js` Uses `dev` in Production
**File:** `ecosystem.config.js` — if this is the PM2 config, verify it's using `npm start` not `npm run dev` for production.

### 25. `morgan` Dependency in `dependencies` Not `devDependencies`
`morgan` and `winston` (not used beyond import) are in production dependencies. `morgan` in dev format is fine for dev but consider production logging strategy.

### 26. Unused `getLocalTherapistData` Fallback
**File:** `lib/api.ts` (lines 217–230)

This fallback calls a local API endpoint `/api/therapists/:id/available-days` that doesn't appear to be mounted on the backend. Dead code path.

---

## Positive Observations

- **Zustand store design** is clean — `partialize` correctly excludes passwords from persistence, `clearFromStep()` provides deterministic state reset
- **Zod validation** on forms is consistently used across all registration forms
- **Backend error handling** via `AppError` and the central `errorHandler` middleware is solid
- **Graceful shutdown** is properly implemented in `backend/src/index.ts`
- **Helmet** is applied globally on the backend
- **Joi validation middleware** exists and is used on auth and appointment routes
- **React Suspense** boundaries used correctly around `useSearchParams` components
- **Google auto-verification flow** handles the edge case cleanly with the `isGoogleAutoVerifying` state flag
- **CI pipeline** runs `npm audit` on both FE and BE on every push — good security hygiene baseline

---

## Recommended Actions (Prioritized)

1. **Immediately**: Rotate ALL credentials in `backend/.env` (JWT, Claim.MD key, Slack webhooks). Add `backend/.env` to `.gitignore` and purge from git history.
2. **Immediately**: Move Slack webhook URL out of `bitbucket-pipelines.yml` into Bitbucket secrets.
3. **This sprint**: Add `authenticate` middleware to all insurance/eligibility routes.
4. **This sprint**: Fix CORS — replace `origin: true` with explicit allowed origin list.
5. **This sprint**: Remove `ignoreBuildErrors: true` and `ignoreDuringBuilds: true` from `next.config.js`. Consolidate to single Next config file.
6. **This sprint**: Add startup guard: throw if `JWT_SECRET` or `CLAIM_MD_ACCOUNT_KEY` env vars are missing.
7. **This sprint**: Remove mock therapist fallback from `lib/api.ts` — show error state instead.
8. **Next sprint**: Migrate `AbandonedFormTrackingService` from in-memory `Map` to MongoDB.
9. **Next sprint**: Split `registration-adult/page.tsx` and `confirmation/page.tsx` into focused hooks + components.
10. **Next sprint**: Fix duplicate eligibility check between verification and confirmation pages.
11. **Ongoing**: Replace all `any` types with proper interfaces. Remove Vietnamese comments. Remove `console.log` calls.

---

## Metrics

- Type Coverage: Low — pervasive `any` in store types, API types, and page components
- Test Coverage: 0% — no test files found
- Linting Issues: Masked — `ignoreDuringBuilds: true` means lint errors never block builds
- Critical Security Issues: 5
- High Priority Issues: 7
- Medium Priority Issues: 8

---

## Unresolved Questions

1. Is `backend/.env` currently tracked in the Bitbucket remote repo? If so, rotation of credentials must happen before any other work.
2. Is the `next` version `^16.1.6` in `package.json` intentional or a typo? This would break `npm install` in CI.
3. What is the intended auth flow for the dashboard? The `/dashboard` page was not reviewed — does it have proper auth guard?
4. Is `morgan('dev')` running in the production deployment? If yes, server logs may be flooded.
5. The `ABANDONED_FORM_TIMEOUT_SECONDS=10` in `.env` seems extremely aggressive for production (10-second timeout before sending a Slack alert). Intentional?
