# REVIEW.md

Code review guidelines for human teammates and AI agents. All categories are grounded in patterns found in this codebase.

---

## 1. API & Query layer

- New hooks must use `createMutation` or `createQuery` from `react-query-kit` — never raw `useMutation` / `useQuery` from TanStack directly.
- Every new query domain must be registered in `src/api/query-factory.ts` using `createQueryKeys`. Query keys must not be hand-rolled strings.
- Requests that send a body should wrap the payload as `{ user: <variables> }` (established in `src/api/auth/use-login.ts` and `src/api/auth/use-sign-up.ts`). Flag any deviation from this pattern and confirm with the team whether it's intentional for that endpoint.
- Paginated endpoints must type their response as `PaginateQuery<T>` (see `src/api/types.ts`). Infinite list consumers must use `normalizePages()` from `src/api/common/utils.tsx` to flatten pages before passing data to FlashList.
- Never add manual camelCase↔snake_case conversion in hooks or components — the interceptors in `src/api/common/interceptors.ts` handle this automatically.

---

## 2. Auth & security

- Auth state and token management must not live in screen components. Business logic belongs in `src/components/providers/auth.tsx`; routing guards belong in `src/app/_layout.tsx`.
- Tokens must be stored exclusively via `storeTokens()` and read via `getTokenDetails()` from `src/components/providers/auth.tsx`. Never store auth tokens in plain React state, `AsyncStorage`, or the general `storage` instance from `src/lib/storage.tsx`.
- All routes that require a logged-in user must be inside the `(app)/` group, wrapped in `Stack.Protected` with `guard={isAuthenticated}` in `src/app/_layout.tsx`. Never replicate this guard inside individual screen files.
- Verify that API calls are not triggered before `ready === true` from `AuthProvider`. Until `ready` is true, the auth state is not yet hydrated from MMKV.
- Token expiry must be evaluated using `dayjs` comparison against the ISO string stored in `authStorage` — do not compare raw Unix timestamps or use `Date` directly.

---

## 3. Type safety

- All API hook `Variables` and `Response` types must be explicitly defined in the same file as the hook. No `any`, no `unknown` without a type guard.
- Zod validation schemas must drive TypeScript types via `z.infer<typeof schema>` — never define the type separately and then write a matching schema; the schema is the source of truth.
- Environment variables must be accessed through `Env` from `@/lib/env`. Never use `process.env` or `Constants.expoConfig?.extra` directly in feature code.
- Axios response/request types must use the types from `src/api/common/axios.d.ts` augmentation where applicable.

---

## 4. i18n

- No hardcoded English (or any language) strings in JSX. Every user-facing string must be retrieved with `useTranslation()`.
- Every new key added in a component must have a corresponding entry in `src/translations/en.json`. Run `pnpm lint:translations` to verify.
- Avoid constructing translation keys dynamically (e.g., ``t(`error.${code}`)``) unless the full key set is exhaustively defined in the translations file.

---

## 5. Styling

- Use NativeWind Tailwind utility classes on React Native primitives. No `StyleSheet.create` except for top-level layout containers (e.g., `flex: 1` wrappers) where Tailwind classes are insufficient.
- Components with multiple visual variants must use `tailwind-variants` — avoid conditional className string concatenation with ternaries or template literals.
- Do not mix NativeWind class-based styling with inline `style` props on the same element unless there is no Tailwind equivalent.

---

## 6. Testing

- Every new component in `src/components/` must have a corresponding test file in `__tests__/components/`.
- Always import `render`, `screen`, `fireEvent`, and `cleanup` from `@/lib/test-utils` (re-exports from `src/lib/test-utils.tsx`) — never import them directly from `@testing-library/react-native`. The custom `render` wraps components with required providers.
- Form component tests must cover at minimum: (1) renders correctly, (2) shows required-field errors on empty submit, (3) shows format validation error on invalid input. See `__tests__/components/login-form.test.tsx` as the canonical reference.
- Native module mocks live in `__mocks__/`. Before adding a new mock, check existing ones (e.g., `react-native-mmkv`, `react-native-gesture-handler`, `moti`) to avoid duplication or conflicts.
- Use `testID` props for interactive elements queried with `getByTestId`. Follow the naming pattern in existing components (e.g., `login-button`, `email-input`, `password-input`).

---

## 7. Performance

- Use `@shopify/flash-list` for any list that can grow (feeds, search results, infinite scroll). Never use `FlatList` for these cases.
- Do not call API query hooks inside top-level layout components (`_layout.tsx`) if only one child screen actually needs that data. Fetch at the screen level.
- Side effects triggered by user actions (form submit, button press) must go inside mutations — not in `useEffect` watching state changes. `useEffect` is for synchronising with external systems, not for reacting to user interactions.
- Avoid anonymous functions or inline object literals as props to FlashList's `renderItem` and `keyExtractor` — use stable references with `useCallback`.
