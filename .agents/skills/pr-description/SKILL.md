---
name: pr-description
description: Generates a structured PR description from the current branch diff, following the repository's pull request template exactly. Use when the user asks to "write a PR description", "generate a PR description", "create a pull request description", "update the PR description", "prepare a PR body", "draft a pull request summary", or "write GitHub pull request text" from the current branch changes.
---

# PR Description

## Purpose

Create a brief, reviewer-friendly PR description from the current branch diff. The output must follow the repository's pull request template exactly, preserving every heading and keeping placeholders where content is unknown.

## Style Rules

- Use plain language. Avoid filler like "this PR aims to", "in order to", and "leverages".
- Be concrete. Name the screens, components, flows, commands, or files that changed.
- Keep it short. Each prose section should usually be 1-3 sentences.
- Avoid bullet soup. If a section needs more than 6 bullets, group related items.
- Skip obvious filler such as import cleanup or lint-only noise unless that is the point of the PR.
- Do not invent Jira tickets, screenshots, devices tested, or implementation details not supported by the diff.

## Workflow

1. Read the repository instructions first:
   - `AGENTS.md`
   - `REVIEW.md` when present, because this repo requires it for review-related work.
2. Find the PR template:
   - Prefer `.github/PULL_REQUEST_TEMPLATE.md`.
   - Fall back to `PULL_REQUEST_TEMPLATE.md` at the repo root only if the GitHub template is absent.
3. Refresh and inspect the branch:
   - Run `git fetch origin master`.
   - Run `git log origin/master..HEAD --oneline`.
   - Run `git diff origin/master...HEAD --stat`.
   - Run `git diff origin/master...HEAD`.
4. Draft the PR description using the exact headings and order from the template.
5. Save it as `PR_DESCRIPTION.md` at the repo root, overwriting any existing file.
6. Ensure `PR_DESCRIPTION.md` is ignored by git. If it is missing from `.gitignore`, append it under:

```gitignore
# PR description scratchpad (agents)
PR_DESCRIPTION.md
```

7. Report back with the relative path only, unless the user asks to see the content.

## Section Guidance For This Repository

The current template is `.github/PULL_REQUEST_TEMPLATE.md`. Keep the warning comment and separators from the template if they are present.

### Jira board reference:

Leave the example placeholder or replace it only if a real Jira ticket is present in the branch name, commits, or user request. Do not invent ticket IDs.

### What does this do?

Write 2-4 concise sentences describing what changed. Focus on user-facing behavior, developer workflow changes, or the concrete problem fixed.

### Why did you do this?

Write 1-3 concise sentences explaining the reason for the change. Tie it to the bug, product need, maintainability concern, or template behavior visible in the diff.

### Who/what does this impact?

Name affected screens, flows, platforms, users, modules, or developer workflows. Use a short sentence or compact bullets. If impact is unclear, leave a placeholder comment instead of guessing.

### Risk Classification

Add the appropriate `risk:*` label when the PR is opened. If the label is unknown, escalate instead of guessing.

- `risk:low` for config, copy, or minor UI tweaks with low blast radius.
- `risk:medium` for feature work or refactors touching multiple files.
- `risk:high` for auth, payments, migrations, or security-sensitive code.

If the branch or user request does not make the risk obvious, leave the template placeholder and call out the uncertainty in Notes.

### How did you test this?

List commands run and manual checks performed. Keep the existing checklist from the template and check only items that are supported by evidence or explicitly provided by the user.

### Notes:

Include caveats, follow-ups, migration notes, or review hints. If there are none, leave the template placeholder.

### Screenshots / Previews

Keep the screenshot/Figma/device placeholders unless real images or recordings are available. Remove irrelevant bug before/after tables only when the template structure still remains clear.

## Final Response

After writing the file, say where it was saved, for example:

`Done: PR_DESCRIPTION.md`

Do not paste the full PR description unless the user asks.
