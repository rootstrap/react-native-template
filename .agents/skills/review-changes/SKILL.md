---
name: review-changes
description: Reviews the current branch diff against this project's architecture, conventions, and code review checklist. Use when the user asks to "review my changes", "review the diff", "check my code", "run a code review", or "review this branch".
allowed-tools: Bash(git:*), Read
---

# Review Changes

## Purpose

Perform a code review of the current branch diff against the project's architecture rules, coding conventions, and the REVIEW.md checklist. Report findings grouped by category, with file and line references where possible.

## Workflow

1. Read the project rules:
   - `AGENTS.md` — critical constraints and glossary
   - `REVIEW.md` — the review checklist; this is the primary source of truth for what to flag
   - `agent_docs/architecture.md` — layer diagram, routing conventions, dual auth system
   - `agent_docs/conventions.md` — API hooks, styling, forms, i18n, anti-patterns

2. Inspect the branch diff:
   - Run `git fetch origin master`.
   - Run `git log origin/master..HEAD --oneline` to understand the commit scope.
   - Run `git diff origin/master...HEAD --stat` to see which files changed.
   - Run `git diff origin/master...HEAD` to read the full diff.

3. If a changed file needs more context to review correctly (e.g. to check imports, types, or hook usage), use Read to open it.

4. Review the diff against every category in REVIEW.md:
   - API & Query layer
   - Auth & security
   - Type safety
   - i18n
   - Styling
   - Testing
   - Performance

5. Also check for violations of the critical constraints in `AGENTS.md`:
   - Package manager (`pnpm` only)
   - Env values via `Env` from `@/lib/env`
   - No auth logic in screen components
   - No manual camelCase↔snake_case conversion
   - No direct MMKV access in components
   - All strings through `useTranslation()`
   - `createMutation` / `createQuery` from `react-query-kit`
   - `createQueryKeys` in `src/api/query-factory.ts`
   - `@shopify/flash-list` for growable lists
   - `expo-crypto` for random IDs
   - `react-hook-form` + `zod` for forms
   - `moti` or `react-native-reanimated` for animations (no `Animated` from RN directly)

6. Check layer boundaries from `agent_docs/architecture.md`:
   - Data flows down: `app/ → components/ → api/ → lib/`
   - Route guards belong only in `src/app/_layout.tsx`, never in screen files
   - Auth state management belongs only in `src/components/providers/auth.tsx` and `src/lib/auth/index.tsx`

## Output Format

Group findings by REVIEW.md category. For each finding:

```
**[Category]** `path/to/file.ts` — short description of the issue and what the correct approach is.
```

If a category has no issues, skip it.

End the report with one of:
- **No issues found** — if the diff is clean across all categories.
- **X issue(s) found** — a one-line summary count.

Do not suggest stylistic preferences not grounded in REVIEW.md, AGENTS.md, or agent_docs/. Do not flag things that are already handled automatically by the interceptors or tooling (e.g. case conversion, token injection).
