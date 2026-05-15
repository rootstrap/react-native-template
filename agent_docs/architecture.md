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
| `src/app/(app)/`                   | Route group for authenticated screens — all screens here require `isAuthenticated`  |
| `Stack.Protected` in `_layout.tsx` | Declarative auth and onboarding gating — do not replicate inside individual screens |
| `src/app/[...messing].tsx`         | 404 catch-all for unmatched routes                                                  |
| `src/app/+html.tsx`                | Web-only HTML shell                                                                 |
| `src/app/www.tsx`                  | In-app WebView presented as a modal                                                 |

Route guards are centralised in `src/app/_layout.tsx`. The `GuardedStack` component reads `isAuthenticated` and `isFirstTime` and applies `Stack.Protected` — nothing inside `(app)/` screens should check auth state or redirect.

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
