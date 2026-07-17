# Query priority, RN mappings, and patterns

Read this when SKILL.md points you here: you need the full query ladder, how the web priority maps onto React Native, how to decide between a query and an accessibility fix, or how to mock this repo's data layer.

## Contents

- [Why query priority matters](#why-query-priority-matters)
- [The ladder, adapted to React Native](#the-ladder-adapted-to-react-native)
- [The accessibility-gap decision](#the-accessibility-gap-decision)
- [Driving inputs and forms](#driving-inputs-and-forms)
- [Mocking the data layer (react-query-kit)](#mocking-the-data-layer-react-query-kit)
- [Testing a screen end-to-end](#testing-a-screen-end-to-end)
- [i18n and matching text](#i18n-and-matching-text)
- [Good vs. bad, side by side](#good-vs-bad-side-by-side)

## Why query priority matters

The priority order is not style preference — it encodes *resemblance to how the software is actually used*. The closer your query is to how a real person (or their screen reader) finds an element, the more your test reflects reality and the more resistant it is to refactors that change nothing a user perceives. `getByRole('button', { name: 'Login' })` keeps passing when the button is restyled, moved, or reimplemented, and fails the moment the button stops being a button or loses its label — which is exactly when a user would be affected. `getByTestId('login-button')` inverts that: it survives the button becoming unreachable and breaks on an internal rename. That is why testID sits at the bottom.

Official reference: https://testing-library.com/docs/queries/about/#priority

## The ladder, adapted to React Native

RNTL doesn't have every web query (there's no meaningful `getByAltText` / `getByTitle`), and a few work differently. Full order for this project:

| Priority | Query | Matches in RN | Use for |
|---|---|---|---|
| 1 | `getByRole(role, { name })` | `accessibilityRole` / `role` + accessible name | Buttons, headers, links, switches, checkboxes, images, search fields, adjustable controls |
| 2 | `getByLabelText` | `accessibilityLabel` | Form fields and controls whose visible label isn't their own text |
| 3 | `getByPlaceholderText` | `TextInput` `placeholder` | Inputs identified by placeholder |
| 4 | `getByText` | visible text nodes | Titles, body copy, validation messages, static labels |
| 5 | `getByDisplayValue` | `TextInput` current value | An input by what's currently typed in it |
| 6 | `getByHintText` | `accessibilityHint` | Rare — only when hint is the only distinguishing metadata |
| 7 | `getByTestId` | `testID` | Last resort (see below) |

Notes specific to RN:
- **Roles need to be set.** `getByRole('button', …)` only matches a node with `accessibilityRole="button"`. Many RN `Pressable`s don't set one. This repo's `Button` renders a bare `Pressable` with a `Text` label and no role — so `getByRole('button')` won't find it, but `getByText('Login')` will, and a press on that text bubbles to the `Pressable`. If you find yourself wanting a role query that doesn't resolve, that's a real gap (see next section).
- **`getByLabelText` ≠ visible label text.** In this repo's `Input`, the `label` prop renders a *sibling* `<Text>`, not the `TextInput`'s `accessibilityLabel`. So `getByLabelText('Email')` does **not** find the email field, and `getByText('Email')` finds the label Text (not the input). This is the most common trap here — see the accessibility-gap decision.
- Use the `{ name }` option on `getByRole` instead of chaining queries; it matches the element's accessible name in one step.

## The accessibility-gap decision

When no accessible query reaches an element, you're at a fork. **The default is not "drop to testID" — it's "make the element accessible."**

Concrete case: to type into `LoginForm`'s email field, you need a handle on that `TextInput`. It has a visible "Email" label (a separate Text node), no placeholder, and no `accessibilityLabel`. Your options, best to worst:

1. **Add `accessibilityLabel="Email"` (or `aria-label`) to the input** in the component, then `getByLabelText('Email')`. This is the right call most of the time: the test reads naturally *and* a screen-reader user can now find the field. The test surfaced a real accessibility defect; fixing the component is the fix. Mention this change when you report back, since it edits product code beyond the test file.
2. **Use a placeholder query** if the field already has (or should have) a placeholder. In `LoginForm` the password field has `placeholder="***"`, so `getByPlaceholderText('***')` works for it.
3. **`getByTestId` as a last resort**, only when adding accessible metadata is genuinely out of scope, with a short comment explaining why and flagging the recommended prop.

Don't silently pick option 3 because it's the least work — that's how a codebase ends up with the testID-everywhere pattern this skill exists to move away from. If you're unsure whether editing the component is in scope, note the gap and the recommended prop in your summary and let the author decide, rather than papering over it with a testID.

## Driving inputs and forms

```tsx
import { cleanup, screen, setup, waitFor } from '@/lib/test-utils';

import { LoginForm } from '../../src/components/login-form';

afterEach(cleanup);

it('submits the typed credentials', async () => {
  const onSubmit = jest.fn();
  const { user } = setup(<LoginForm onSubmit={onSubmit} />);

  // Assumes the inputs expose accessibilityLabel (add it to the component if not).
  await user.type(screen.getByLabelText('Email'), 'ada@example.com');
  await user.type(screen.getByLabelText('Password'), 'secret123');
  await user.press(screen.getByText('Login'));

  await waitFor(() =>
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'ada@example.com', password: 'secret123' }),
      expect.anything(),
    ),
  );
});
```

- `await` every `user.*` call — they're async.
- react-hook-form validation and submission are async; assert results with `findBy*` / `waitFor`, never a bare `getBy*` immediately after a press.
- If a field has no accessible handle yet, `fireEvent.changeText(screen.getByTestId('email-input'), value)` is the honest last-resort way to drive it — leave the comment recommending an `accessibilityLabel`.

## Mocking the data layer (react-query-kit)

Screens pull data through hooks in `src/api/<domain>/use-<action>.ts`. Don't hit the network — mock the hook module so you control the state the UI renders.

```tsx
import { usePosts } from '@/api';

jest.mock('@/api', () => ({
  ...jest.requireActual('@/api'),
  usePosts: jest.fn(),
}));

const mockUsePosts = usePosts as jest.Mock;

it('renders the empty state when there are no posts', () => {
  mockUsePosts.mockReturnValue({ data: [], isPending: false, isError: false });
  render(<Feed />);
  expect(screen.getByText('No posts yet')).toBeOnTheScreen();
});

it('renders the loaded posts', () => {
  mockUsePosts.mockReturnValue({
    data: [{ id: 1, title: 'Hello world' }],
    isPending: false,
    isError: false,
  });
  render(<Feed />);
  expect(screen.getByText('Hello world')).toBeOnTheScreen();
});
```

Match the mock's return shape to what the hook actually exposes (check the hook file). Mock **loading**, **error**, and **success/empty** where the component branches on them — those branches are the behavior worth covering.

## Testing a screen end-to-end

Same tools, wider scope: render the screen, mock its data hooks, drive one real user flow, assert the observable outcome (content shown, navigation triggered, mutation called). Mock navigation targets / mutation hooks and assert they were invoked rather than asserting a route actually changed. Some screens pull in modules RNTL can't render (e.g. `expo-router`'s `Link`, `react-native-keyboard-controller`); mock those at the top of the test file.

## i18n and matching text

User-facing strings come from `translate()` / `useTranslation()` reading `src/translations/en.json`. In tests, i18n resolves to the English string, so query the **rendered English text** (`getByText('Sign In')`, `findByText('Email is required')`) — the same values a user sees. Look strings up in `en.json` rather than guessing; don't assert on translation *keys* (`auth.signIn.title`), which never appear on screen.

## Good vs. bad, side by side

```tsx
// ❌ Brittle: queries internals, asserts appearance
const btn = screen.getByTestId('login-button');
expect(btn.props.className).toContain('bg-black');
fireEvent.press(btn);

// ✅ Resembles use: found by what it says, asserts what happens
await user.press(screen.getByText('Login'));
expect(await screen.findByText('Email is required')).toBeOnTheScreen();
```

```tsx
// ❌ Asserts a color the user's task never depends on
expect(screen.getByText('Delete').props.style.color).toBe('#dc2626');

// ✅ Asserts the consequence of the interaction
await user.press(screen.getByText('Delete'));
expect(await screen.findByText('Confirm Delete')).toBeOnTheScreen();
```
