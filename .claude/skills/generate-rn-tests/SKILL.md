---
name: generate-rn-tests
description: >-
  Write unit and integration tests for React Native components and screens with React Native Testing Library (RNTL). Use this whenever the user asks to test, add tests for, or write a test/spec for a component, screen, form, or feature — and whenever new component/screen code lands without tests. Covers which components are worth testing (behavior-rich organisms, not presentational atoms), how to query the way a user perceives the UI (accessibility-first, testID as a last resort), and what to assert (user-observable behavior, not styling or internals). Trigger on phrases like "test this component", "write tests for the login form", "add a spec", "cover this screen with tests", "RNTL", or "testing library".
---

# Generating React Native tests

Tests here exist to answer one question: **does the app still behave the way a user experiences it?** Everything below follows from that. A test that a user could not tell had broken (a class name, an internal state variable, a prop that happens to be passed) is noise — it fails on refactors that changed nothing the user sees, and stays green when the thing the user cares about breaks.

This project uses `@testing-library/react-native` (v12) on `jest-expo`, with `userEvent`.

**You are establishing a new standard, and it deliberately departs from the existing suite.** There already is a test suite under `__tests__/`, but most of it does the opposite of what this skill asks: it finds elements by `testID` (`getByTestId('login-button')`), drives them with `fireEvent` instead of `userEvent`, tests presentational primitives, and even asserts styling by reading class names off internal props (see `__tests__/components/ui/button.test.tsx`, whose own `// TODO` admits the className assertions are wrong). Treat those files as the pattern to move *away* from — match their location and setup conventions (below), not their query or assertion style.

## 1. Decide whether the component is worth a test

Not everything gets a test. Testing a purely presentational primitive mostly re-asserts React and the styling library — high maintenance, near-zero signal. Judge by **behavior**, not by folder:

**Write tests when the component owns behavior a user can trigger or observe:**
- Composes several children into a flow (forms, screens, list + item + empty state, multi-step UI).
- Holds state or logic: validation, conditional rendering, toggles, submission, data fetching, navigation on an action.
- Reacts to user input: press, type, select, swipe, submit.

Good candidates in this repo: `src/components/*-form.tsx`, screens in `src/app/`, `src/components/settings/*` items with actions, and composite primitives that carry real logic (e.g. `src/components/ui/select.tsx`, `checkbox.tsx`).

**Skip when the component is a leaf that only renders props:**
- A `Text`/label wrapper, an icon, a styled `View`, a button that only forwards `onPress` and shows a label. There is no user-observable behavior of its own — it gets exercised for real inside the organism that uses it. (This is why `src/components/ui/button.tsx` does not warrant its own suite, despite the existing one.)

If you are unsure, ask: *"What could a user do here, and what would they see happen?"* If you can't name a concrete behavior, don't write the test.

This project does not distinguish "unit" from "integration" tests by structure — both render the real component and drive it as a user would. The only difference is scope: a form in isolation vs. a screen wired to (mocked) data hooks. Same tools, same query rules, same assertion style.

## 2. Set up the test file

- **Location:** tests live under `__tests__/`, mirroring the `src/` path. `src/components/login-form.tsx` → `__tests__/components/login-form.test.tsx`; `src/components/settings/delete-account-item.tsx` → `__tests__/components/settings/delete-account-item.test.tsx`. Jest matches `*.test.tsx` / `*.spec.tsx`. Do not colocate next to the component — follow the existing mirror layout.
- **Import the component under test** the way neighboring test files do (a relative path from `__tests__/`, e.g. `../../src/components/login-form`, or the `@/` alias — both resolve). **Import `render` / `setup` / `screen` / `cleanup` / `waitFor` from `@/lib/test-utils`, never from `@testing-library/react-native` directly.** The local module wraps every render in the app's providers (navigation, bottom-sheet); the raw import skips them and your component crashes or behaves unlike production. This is a standing repo rule (see `agent_docs/conventions.md`).
- Use **`setup(<Component />)`** when the test involves user interaction — it returns a configured `userEvent` instance plus the render result: `const { user } = setup(<LoginForm />)`. Use `render(...)` only for render-and-read tests with no interaction.
- Prefer `userEvent` (`await user.press(...)`, `await user.type(...)`) over `fireEvent`. It mimics real gesture/timing sequences; reach for `fireEvent` only for events `userEvent` doesn't model (e.g. `fireEvent.changeText` on an input with no accessible handle).
- Add `afterEach(cleanup)` at the top of the file.
- MMKV is auto-mocked globally and the react-hook-form window shim is already in `jest-setup.ts` — you don't set those up per test. A component may still need its own mock for a module RNTL can't render (e.g. `expo-router`'s `Link`, or `react-native-keyboard-controller`); add those at the top of the test file.

## 3. Query the way a user perceives the UI

This is the core of the skill. A user does not find the submit button by its `testID` — they find it because it is a button that says "Login". Query the same way. Follow this priority, top to bottom, and only descend when the tier above genuinely doesn't fit:

1. **`getByRole(role, { name })`** — role + accessible name. The closest thing to how assistive tech and users perceive an element (`getByRole('button', { name: 'Login' })`).
2. **`getByLabelText`** — form fields and controls exposed via `accessibilityLabel`.
3. **`getByPlaceholderText`** — inputs identified by placeholder.
4. **`getByText`** — visible, non-interactive text (titles, messages, validation errors).
5. **`getByDisplayValue`** — an input by its current value.
6. **`getByTestId`** — **last resort only.** See below.

**testID is a fallback, not a default.** The components in this repo are covered in `testID`s (`email-input`, `login-button`, `form-title`) and the existing tests lean on them — do **not** take that as license to query by them. A `testID` proves nothing a user cares about and often masks a real accessibility gap. When an accessible query doesn't work because the component lacks the metadata (e.g. a `TextInput` with a visible label but no `accessibilityLabel` — exactly the case for this repo's `Input`), the better fix is usually to **add the accessibility prop to the component**: it makes the query work *and* makes the app usable with a screen reader. Reach for `getByTestId` only when adding accessible metadata is genuinely out of scope, and leave a one-line comment saying why.

For the full priority rationale, the RN-specific query mapping, the accessibility-gap decision, and mocking patterns, read [references/query-priority.md](references/query-priority.md).

## 4. Assert user-observable behavior, not appearance or internals

Test what the user would notice:
- Text/messages appearing or disappearing (validation errors, empty states, loaded content).
- Elements being present, enabled/disabled, or gone.
- A handler firing with the right payload when the user completes an action (`expect(onSubmit).toHaveBeenCalledWith(...)`).
- Navigation or a data mutation being triggered by an interaction.

**Do not** assert styling, colors, class names, layout, or internal state. "Is this button blue?" is not a behavior a test should guard — it's brittle and it isn't what the user relies on. The existing `button.test.tsx` reaches into `button.props.children[0].props.className` to compare style strings; that is precisely the kind of assertion to avoid. If a design token matters that much, that's a visual-regression concern, not a RNTL test. Focus on function: *given this interaction, does the right thing happen?*

Use `findBy*` (async) for anything that appears after an interaction or async work; use `getBy*` for what's present on initial render; use `queryBy*` only to assert absence (`expect(screen.queryByText(...)).toBeNull()`).

## 5. Worked example

A behavioral test of `LoginForm` at `__tests__/components/login-form.test.tsx` — queries by what the user sees, asserts what the user experiences (empty submit surfaces validation errors):

```tsx
import { cleanup, screen, setup } from '@/lib/test-utils';

import { LoginForm } from '../../src/components/login-form';

afterEach(cleanup);

describe('LoginForm', () => {
  it('shows validation errors when submitted empty', async () => {
    const onSubmit = jest.fn();
    const { user } = setup(<LoginForm onSubmit={onSubmit} />);

    // The user reads the screen title and finds the button by its label.
    expect(screen.getByText('Sign In')).toBeOnTheScreen();
    await user.press(screen.getByText('Login'));

    // The user sees why the form didn't submit.
    expect(await screen.findByText('Email is required')).toBeOnTheScreen();
    expect(screen.getByText('Password is required')).toBeOnTheScreen();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
```

Note what this does *not* do: no `getByTestId('login-button')`, no assertion on the button's color or class. It fails only when the user-facing behavior breaks.

More patterns — driving inputs, mocking react-query-kit hooks, testing screens end-to-end, and the accessibility-gap decision — are in [references/query-priority.md](references/query-priority.md).

## Before finishing

Read [REVIEW.md](../../../REVIEW.md) and apply it to the test files you wrote, the same as any other change. Report the file(s) created; the user runs the suite (`pnpm test <file>`) — this skill authors tests, it does not execute them.
