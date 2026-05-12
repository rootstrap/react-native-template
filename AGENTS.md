# AGENTS.md

This is a React Native + Expo template maintained by Rootstrap. It provides a production-ready starting point for mobile apps targeting iOS, Android, and Web. It is used as the base for client projects and internal tooling at Rootstrap.

When reviewing code, read and apply the rules in ./REVIEW.md

---

## Glossary

| Term               | Definition                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AuthProvider`     | React Context provider in `src/components/providers/auth.tsx` — manages reactive auth state for the UI layer                                                 |
| `useAuth`          | Hook to consume `AuthProvider` context (UI layer) OR Zustand store selector from `src/lib/auth/index.tsx` (imperative layer) — do not confuse them           |
| `hydrateAuth`      | Called once at app startup (`src/app/_layout.tsx`) to rehydrate Zustand auth state from MMKV storage                                                         |
| `TokenType`        | Shape of the Devise Token Auth token object: `{ bearer, access, client, uid, expiry }` — defined in `src/lib/auth/utils.tsx`                                 |
| `HEADER_KEYS`      | Constant map of Devise Token Auth header names (`access-token`, `client`, `uid`, `expiry`, `Authorization`) — defined in `src/components/providers/auth.tsx` |
| `isFirstTime`      | Boolean persisted in MMKV via `src/lib/hooks/use-is-first-time.tsx` — controls whether the onboarding screen is shown                                        |
| `Env`              | Runtime environment config imported from `@/lib/env` (populated via `expo-constants`) — the only safe way to read env values                                 |
| `PaginateQuery<T>` | Paginated API response shape: `{ results: T[], count, next, previous }` — defined in `src/api/types.ts`                                                      |
| `normalizePages`   | Utility in `src/api/common/utils.tsx` that flattens TanStack infinite query pages into a flat array for FlashList                                            |
| `queryFactory`     | Merged query key registry built with `@lukemorales/query-key-factory` — defined in `src/api/query-factory.ts`                                                |
| `createMutation`   | Factory from `react-query-kit` for creating typed mutation hooks — required pattern for all mutations                                                        |
| `createQuery`      | Factory from `react-query-kit` for creating typed query hooks — required pattern for all queries                                                             |

---

## Critical constraints

- **Package manager**: Always use `pnpm`. Never suggest `npm install` or `yarn`. Enforced via `preinstall` hook.
- **Env values**: Never hardcode environment-specific values. Always use `Env` from `@/lib/env`.
- **Auth logic in screens**: Never add authentication state or redirect logic inside screen components. Auth state lives in `AuthProvider`; routing guards live in `src/app/_layout.tsx` via `Stack.Protected`.
- **Case transformation**: Never add manual camelCase↔snake_case conversion. The Axios interceptors in `src/api/common/interceptors.ts` handle this automatically for all requests and responses.
- **MMKV access**: Never call `storage` (from `src/lib/storage.tsx`) or `authStorage` directly inside components. Use the exported helper functions (`getItem`, `setItem`, `removeItem`, `storeTokens`, `getTokenDetails`, `clearTokens`).
- **Strings**: All user-facing strings must use `useTranslation()`. Every key must exist in `src/translations/en.json`.
- **API hooks**: New hooks must use `createMutation` or `createQuery` from `react-query-kit`. Never use raw `useMutation` or `useQuery` from TanStack directly.
- **Query keys**: Every new query domain must be registered in `src/api/query-factory.ts` using `createQueryKeys` from `@lukemorales/query-key-factory`.
- **Lists**: Use `@shopify/flash-list` for any list that can grow. Never use `FlatList` for feed-style content.
- **Crypto/IDs**: Use `expo-crypto` for random IDs. Never use `Math.random()` or `Date.now()` as identifiers.
- **New dependencies**: Before installing any library, verify the latest version compatible with this stack — React Native 0.81, Expo SDK 54, and React 19. Check compatibility via `npx expo install <package>` (which resolves the Expo-blessed version) or the package's peer dependencies. Do not install the latest npm version blindly — it may not support this SDK version.

---

## Table of contents

| File                         | Description                                                                      |
| ---------------------------- | -------------------------------------------------------------------------------- |
| `agent_docs/architecture.md` | Layer diagram, folder structure, routing conventions, dual auth system explained |
| `agent_docs/conventions.md`  | API hook patterns, styling, forms, i18n, anti-patterns                           |
| `agent_docs/commands.md`     | All pnpm commands for dev, test, lint, build, and setup                          |

## Imported Claude Cowork project instructions
