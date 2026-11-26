# Architecture

## What the app does

This template ships four top-level concerns out of the box:

- **Onboarding** — a one-time screen shown on first launch, gated by the `isFirstTime` flag persisted in MMKV.
- **Authentication** — sign-in, sign-up, forgot-password, and update-password flows backed by Devise Token Auth.
- **Feed** — a paginated post list with detail view and a create-post screen.
- **Settings** — theme toggle, language selection, and account deletion.

---

## Layer diagram

```
src/app/          ← Expo Router file-based routing, navigation guards
      ↓
src/components/   ← UI primitives (ui/) and feature components; AuthProvider lives here
      ↓
src/api/          ← Axios client, interceptors, react-query-kit hooks
      ↓
src/lib/          ← Auth state (Zustand), storage (MMKV), i18n, env, utilities
```

Data flows down; side-effects (navigation, token refresh) are handled at the layer where they originate.

---

## Expo Router conventions

| Pattern                            | Meaning                                                                             |
| ---------------------------------- | ----------------------------------------------------------------------------------- |
| `src/app/(app)/`                   | Route group for the authenticated tabs — all screens here require `isAuthenticated` |
| `Stack.Protected` in `_layout.tsx` | Declarative auth and onboarding gating — do not replicate inside individual screens |
| `src/app/[...messing].tsx`         | 404 catch-all for unmatched routes                                                  |
| `src/app/+html.tsx`                | Web-only HTML shell                                                                 |
| `src/app/www.tsx`                  | In-app WebView presented as a modal                                                 |

Route guards are centralised in `src/app/_layout.tsx`. The `GuardedStack` component reads `isAuthenticated`, `isFirstTime` and the pending deep link, and applies `Stack.Protected` — no screen should check auth state or redirect. Authenticated routes do not have to live in `(app)/`: stack screens that sit outside the tabs (e.g. `feed/[id]`, `feed/add-post`, `update-password`) are declared directly under the authenticated `Stack.Protected`. The screens under the authenticated and logged-out guards are rendered from `AUTHENTICATED_SCREENS` and `AUTH_SCREENS` in `src/lib/auth/deep-link-path.ts`, so adding or moving a guarded screen means editing those lists (plus `GUARDED_SCREEN_OPTIONS` in `src/app/_layout.tsx` when the screen needs options).

### Deep links into protected screens

A logged-out user who opens a link to a protected screen is sent to sign-in and lands on that screen after logging in:

1. `src/app/+native-intent.tsx` normalises every incoming link with `toAppPath()` and, if `isReturnToPath()` accepts it (an in-app path that does not resolve to a public or auth screen, dot segments included), stores it in the pending deep link store (`src/lib/auth/pending-deep-link.ts`). Any other link, or one that cannot be parsed, clears the store so a stale target is never reused.
2. `getFallbackRoute()` (`src/lib/auth/get-fallback-route.ts`) uses the pending link as the `redirectTo` of the guards once the user is authenticated, and falls back to `/` for anything that is not a valid return-to path.
3. `GuardedStack` clears the pending link once the user is past sign-in, or when onboarding takes over.

---

## Where each concern lives

| Concern                                            | Location                                             |
| -------------------------------------------------- | ---------------------------------------------------- |
| Routing & navigation guards                        | `src/app/_layout.tsx`                                |
| Authenticated tab layout                           | `src/app/(app)/_layout.tsx`                          |
| Auth state — reactive (UI)                         | `src/components/providers/auth.tsx`                  |
| Auth state — imperative (outside React)            | `src/lib/auth/index.tsx`                             |
| Token shape & MMKV helpers                         | `src/lib/auth/utils.tsx`                             |
| HTTP client (Axios instance)                       | `src/api/common/client.tsx`                          |
| Request/response transformation & token injection  | `src/api/common/interceptors.ts`                     |
| Auth-specific interceptors & `authStorage`         | `src/components/providers/auth.tsx`                  |
| API hooks                                          | `src/api/<domain>/use-<action>.ts`                   |
| Shared API utilities (pagination, case conversion) | `src/api/common/utils.tsx`                           |
| Query key registry                                 | `src/api/query-factory.ts`                           |
| Shared UI primitives                               | `src/components/ui/`                                 |
| Feature-level components                           | `src/components/<feature>/`                          |
| i18n setup & utilities                             | `src/lib/i18n/`                                      |
| Translation strings                                | `src/translations/en.json`                           |
| Environment config                                 | `src/lib/env.js` (access via `Env` from `@/lib/env`) |
| General persistent storage                         | `src/lib/storage.tsx` (MMKV)                         |
| Analytics — event catalogue & provider contract    | `src/lib/analytics/types.ts`                         |
| Analytics — context, `useAnalytics()`, screen tracking, reset on sign out | `src/components/providers/analytics.tsx`, `src/components/providers/analytics-tracking.ts` |
| Global TypeScript types                            | `src/types/index.ts`                                 |

---

## The dual auth system

There are two auth layers that coexist for different reasons:

### 1. `src/lib/auth/index.tsx` — Zustand store

- Holds `TokenType` state and `signIn` / `signOut` / `hydrate` actions.
- Used **imperatively** outside of React — e.g., `hydrateAuth()` is called at the very top of `src/app/_layout.tsx` before any component mounts, so the token is available synchronously when interceptors first run.
- Also consumed by the Axios request interceptor in `src/api/common/interceptors.ts` via `useAuth.getState().token` — this is a Zustand selector called outside React, which is valid.

### 2. `src/components/providers/auth.tsx` — React Context

- Wraps the app in `<AuthProvider>` and exposes `{ token, isAuthenticated, loading, ready, logout }` via `useAuth()`.
- Manages its own `authStorage` MMKV instance and sets up **its own** Axios interceptors for token persistence from response headers and 401 handling.
- Drives the UI — `GuardedStack` in `_layout.tsx` reads `isAuthenticated` and `ready` from this provider.

**How they relate**: The Zustand store handles the imperative bootstrap path (token hydration before React renders). The Context provider handles the reactive UI path (updating components when auth state changes). They share the same underlying MMKV data but through separate instances. Do not collapse them into one — the separation is intentional.
