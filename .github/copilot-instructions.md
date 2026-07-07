  # Copilot Instructions

  ## Project
  React Native + Expo template maintained by Rootstrap. Production-ready starting point for mobile apps targeting iOS, Android, and Web, used as the base for client projects and internal tooling. Ships onboarding, Devise Token Auth authentication, a paginated feed, and settings out of the box.

  Full details in `AGENTS.md`, `agent_docs/architecture.md`, `agent_docs/conventions.md`, and `REVIEW.md` (code review checklist) at the repo root — read these before non-trivial changes.

  ## Stack
  - React Native 0.81, Expo SDK 54, React 19, TypeScript 5
  - Expo Router (file-based routing, `src/app/`)
  - NativeWind (Tailwind for React Native) + `tailwind-variants`
  - TanStack Query via `react-query-kit`, Axios, `@lukemorales/query-key-factory`
  - Zustand (imperative auth store) + React Context (`AuthProvider`, reactive UI auth)
  - `react-hook-form` + `zod` for forms
  - `react-native-mmkv` for storage, `dayjs` for dates, `expo-crypto` for IDs
  - `moti` / `react-native-reanimated` for animation
  - `@shopify/flash-list` for lists, `react-i18next` for i18n
  - Jest + `@testing-library/react-native` for tests, Maestro for e2e
  - Package manager: pnpm only (enforced via `preinstall`)

  ## Conventions
  - Functional components only, no class components
  - TypeScript strict mode — avoid `any`
  - API hooks: use `createMutation` / `createQuery` from `react-query-kit`, never raw `useMutation` / `useQuery`; place at `src/api/<domain>/use-<action>.ts`
  - New query domains must be registered in `src/api/query-factory.ts`
  - Styling: NativeWind `className` on primitives; `tailwind-variants` for multi-state components; `StyleSheet.create` only for root layout containers
  - Forms: `react-hook-form` + `zod` resolver, type via `z.infer`, no `useState` for form state, no `Alert.alert()` for validation errors
  - Strings: always through `useTranslation()`, keys defined in `src/translations/en.json`
  - Write camelCase in TypeScript everywhere — Axios interceptors handle camelCase↔snake_case conversion, never do it manually
  - Auth/routing guards live only in `src/app/_layout.tsx` via `Stack.Protected` — never inside screen components
  - Storage access only through helpers in `src/lib/storage.tsx` (`getItem`/`setItem`/`removeItem`) or auth helpers (`storeTokens`/`getTokenDetails`/`clearTokens`) — never call `storage`/`authStorage` directly
  - Lists that can grow: `@shopify/flash-list`, never `FlatList`
  - IDs: `expo-crypto`, never `Math.random()` / `Date.now()`
  - Never hardcode env values — use `Env` from `@/lib/env`

  ## What to focus on in reviews
  - Auth or redirect logic added inside screen components instead of `_layout.tsx`
  - Manual camelCase/snake_case conversion duplicating the interceptors
  - Raw `useMutation`/`useQuery` instead of `react-query-kit` factories
  - Direct `storage`/`authStorage` access bypassing helper functions
  - Hardcoded secrets, API keys, or environment-specific values
  - Missing translation keys or dynamically constructed i18n keys
  - `FlatList` used for growing/feed-style content instead of `FlashList`
  - Unhandled async errors
  - New dependencies not verified for Expo SDK 54 / RN 0.81 compatibility
  - Accessibility issues (missing labels, keyboard navigation)

## Classify

Every code review comment must include one of the following labels:

| Label | Meaning |
|-------|---------|
| `ai:clean` | No significant issues found. The code follows the project conventions and no changes are required. |
| `ai:minor` | Minor issues such as style, readability, maintainability, naming, small performance improvements, or convention violations that are not likely to cause bugs. |
| `ai:serious` | Significant issues including security vulnerabilities, logic errors, crashes, data corruption, broken functionality, race conditions, missing error handling, or architectural violations that should be fixed before merging. |

### Review Rules

- Every review comment **must** start with one of the labels above.
- Do **not** use more than one label per comment.
- Only create review comments for actionable issues.
- If no issues are found, leave a single review comment labeled `ai:clean` indicating the review passed.

### Overall Review Classification

The **main (summary) review comment** must also include a single overall classification label representing the entire review:

- `ai:clean` — No significant issues found.
- `ai:minor` — Only minor suggestions were found.
- `ai:serious` — At least one serious issue was identified.

Determine the overall label using the highest severity found during the review:

- If any comment is `ai:serious`, the overall review must be `ai:serious`.
- Otherwise, if any comment is `ai:minor`, the overall review must be `ai:minor`.
- Otherwise, the overall review must be `ai:clean`.

The summary should begin with the overall label, for example:

```
Overall Review: ai:minor

Summary:
- 2 minor convention violations
- No security or correctness issues
```

or

```
Overall Review: ai:serious

Summary:
- Logic bug in authentication flow
- Missing async error handling
- Hardcoded environment value
```