# Conventions

## API hooks

All API hooks are created with `react-query-kit`. See `src/api/auth/use-login.ts` for a canonical mutation example and `src/api/auth/use-user.tsx` for a query example.

**Mutation shape:**

```ts
export const useMyAction = createMutation<Response, Variables>({
  mutationFn: (variables) => myApiCall(variables),
});
```

**Query shape:**

```ts
export const useMyResource = createQuery<Response, Variables>({
  queryKey: queryFactory.domain.list(variables),
  fetcher: (variables) => myApiCall(variables),
});
```

- Place hook files at `src/api/<domain>/use-<action>.ts`.
- Always define explicit `Variables` and `Response` types in the same file.
- Never use raw `useMutation` or `useQuery` from `@tanstack/react-query` directly.

---

## Request body wrapping

All auth endpoints wrap the payload as `{ user: variables }`:

```ts
data: {
  user: variables;
}
```

This is established in `src/api/auth/use-login.ts` and `src/api/auth/use-sign-up.ts`. **This pattern applies to auth endpoints.** For non-auth domains, confirm the API contract before assuming the same wrapping — flag deviations in code review.

---

## Pagination

Paginated responses follow the `PaginateQuery<T>` shape from `src/api/types.ts`:

```ts
{ results: T[], count: number, next: string | null, previous: string | null }
```

- Use `normalizePages()` from `src/api/common/utils.tsx` to flatten TanStack infinite query pages into a flat array before passing to FlashList.
- Pagination cursors are offset-based — extracted from the `next`/`previous` URL parameters via `getNextPageParam` / `getPreviousPageParam` in `src/api/common/utils.tsx`.

---

## camelCase ↔ snake_case

- **Always write camelCase in TypeScript** — types, variables, props, and object keys.
- The Axios interceptors in `src/api/common/interceptors.ts` convert request bodies to snake_case before sending and response bodies to camelCase on receipt.
- **Never add manual case conversion** in hooks, components, or services. If a field arrives in the wrong case, the interceptor is the place to fix it.

---

## Styling

- Use **NativeWind Tailwind utility classes** directly on React Native primitives via the `className` prop.
- Use **`tailwind-variants`** for components that have multiple visual states or variants — avoids messy conditional class concatenation.
- Only use `StyleSheet.create` for top-level layout containers where Tailwind is insufficient (e.g., `flex: 1` on a root view). See `src/app/_layout.tsx` for a real example.
- Do not mix `className` and `style` on the same element unless there is no Tailwind equivalent for the required property.

---

## Forms

- All forms use `react-hook-form` with a `zod` schema resolver.
- Derive the TypeScript type from the schema with `z.infer<typeof schema>` — do not write a separate type.
- Validation errors are surfaced through form state (e.g., `errors.email.message`) and displayed inline. Never use `Alert.alert()` for validation feedback.
- See `src/components/login-form.tsx` and `src/components/sign-up-form.tsx` for the canonical pattern.

---

## i18n

- All user-facing strings go through `useTranslation()` from `react-i18next`.
- Keys are defined in `src/translations/en.json`. Add the key there before using it in a component.
- Run `pnpm lint:translations` to catch missing or unused keys.
- Do not construct keys dynamically (e.g., ``t(`errors.${code}`)``) unless every possible value of `code` is already in the translations file.
- RTL support is initialised in `src/lib/i18n/index.tsx` — do not override `I18nManager` settings elsewhere.

---

## Token expiry

Token expiry is evaluated by comparing `dayjs()` to the ISO string stored in `authStorage` under the `expiry` key. See `src/components/providers/auth.tsx` for the `checkToken` function. When writing any token validation logic, use `dayjs` — do not parse the expiry string with `new Date()` or compare Unix timestamps directly.

---

## Anti-patterns

| Anti-pattern                                                               | Why it's wrong                                                                              | Correct approach                                                    |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Duplicating interceptor logic for token injection                          | Already handled in `src/api/common/interceptors.ts` and `src/components/providers/auth.tsx` | Do not add token headers manually in hooks                          |
| Adding `Stack.Protected` or `<Redirect>` inside a screen                   | Auth routing lives in `src/app/_layout.tsx`                                                 | Move guards to `_layout.tsx`                                        |
| Calling `storage.getString()` directly in a component                      | Bypasses the helper abstraction                                                             | Use `getItem` / `setItem` / `removeItem` from `src/lib/storage.tsx` |
| Calling `authStorage` directly outside `src/components/providers/auth.tsx` | Tightly couples unrelated code to the auth storage instance                                 | Use `getTokenDetails()` / `storeTokens()` / `clearTokens()`         |
| Using `Math.random()` or `Date.now()` for IDs                              | Not cryptographically safe                                                                  | Use `expo-crypto` which is already installed                        |
| Importing `render` from `@testing-library/react-native` directly           | Skips provider wrappers                                                                     | Import from `@/lib/test-utils`                                      |
