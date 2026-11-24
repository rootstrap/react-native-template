---
title: Changes over Obytes Starter
description: What our talented team of engineers at Rootstrap has added so far on top of the Obytes starter.
head:
  - tag: title
    content: Changes over Obytes Starter | React Native / Expo Starter
---

This template is a fork of the [Obytes starter](https://github.com/obytes/react-native-template-obytes). We keep everything that makes the original great and periodically merge its new releases, but we also adjust it to the way we build apps at Rootstrap. This page lists those adjustments so you can quickly tell what is different without digging through the pull request history.

:::note
The list below only covers changes we made on top of the upstream starter. For the features that come from Obytes, check the [Overview](/overview) page and the [upstream changelog](https://github.com/obytes/react-native-template-obytes/releases). Every item links to the pull request that introduced it in the [template repository](https://github.com/rootstrap/react-native-template).
:::

## Authentication and networking

- **Complete auth screens.** Sign in, sign up, forgot password, update password and delete account flows, each built with `react-hook-form` + `zod` and backed by `react-query-kit` hooks ([#111](https://github.com/rootstrap/react-native-template/pull/111), [#114](https://github.com/rootstrap/react-native-template/pull/114), [#109](https://github.com/rootstrap/react-native-template/pull/109), [#117](https://github.com/rootstrap/react-native-template/pull/117), [#120](https://github.com/rootstrap/react-native-template/pull/120), [#118](https://github.com/rootstrap/react-native-template/pull/118)).
- **In-app WebView screen** (`www`) used to open the terms and conditions or any external URL as a modal ([#112](https://github.com/rootstrap/react-native-template/pull/112)).
- **Protected routes.** `Stack.Protected` guards in the root layout split onboarding, authenticated and unauthenticated stacks, so screens never need their own redirect logic ([#136](https://github.com/rootstrap/react-native-template/pull/136)).
- **`AuthProvider` context.** A React context keeps tokens in a dedicated MMKV instance, exposes `isAuthenticated` / `ready` / `logout` to the UI and handles `401` responses, complementing the Zustand store inherited from upstream ([#116](https://github.com/rootstrap/react-native-template/pull/116)).
- **Devise Token Auth support.** The interceptors inject the `access-token`, `client`, `uid`, `expiry` and `Authorization` headers on every request and capture them from responses, so the template works out of the box with a Rails API using Devise Token Auth ([#85](https://github.com/rootstrap/react-native-template/pull/85), [#116](https://github.com/rootstrap/react-native-template/pull/116)).
- **Axios interceptors with automatic case conversion.** Request bodies are converted to `snake_case` and responses to `camelCase`, including nested objects, so the TypeScript code always uses `camelCase` ([#6](https://github.com/rootstrap/react-native-template/pull/6), [#28](https://github.com/rootstrap/react-native-template/pull/28), [#119](https://github.com/rootstrap/react-native-template/pull/119)).
- **Query key factory.** Query keys are centralized in `src/api/query-factory.ts` with [`@lukemorales/query-key-factory`](https://github.com/lukemorales/query-key-factory), avoiding hand-written key strings and typos ([#85](https://github.com/rootstrap/react-native-template/pull/85)).

## Project setup and CLI

- **`create-rootstrap-rn-app` CLI.** The CLI was renamed and republished under our own npm package, and it clones the latest release of this repository instead of the upstream one ([#17](https://github.com/rootstrap/react-native-template/pull/17), [#18](https://github.com/rootstrap/react-native-template/pull/18)). A manual GitHub Action publishes new CLI versions to npm ([#23](https://github.com/rootstrap/react-native-template/pull/23)).
- **Project clean-up on creation.** The CLI removes template-only files (docs site, CLI, docs and CLI deploy workflows, license), renames `README-project.md` to `README.md`, sets the project name in `env.js`, the Expo config slug and the README, and strips the template warning from the pull request template ([#62](https://github.com/rootstrap/react-native-template/pull/62), [#64](https://github.com/rootstrap/react-native-template/pull/64), [#65](https://github.com/rootstrap/react-native-template/pull/65), [#66](https://github.com/rootstrap/react-native-template/pull/66)).
- **Git branches out of the box.** New projects are initialized with an initial commit on `develop` plus `qa` and `main` branches, matching the branch-to-environment mapping used by the build workflow ([#158](https://github.com/rootstrap/react-native-template/pull/158)).
- **`.nvmrc` file** pinning the Node.js version so `fnm` / `nvm` pick the right one in the template and in generated projects ([#139](https://github.com/rootstrap/react-native-template/pull/139)).
- **Rootstrap branding** for the app name, logo, README and this documentation site ([#9](https://github.com/rootstrap/react-native-template/pull/9), [#41](https://github.com/rootstrap/react-native-template/pull/41), [#42](https://github.com/rootstrap/react-native-template/pull/42), [#58](https://github.com/rootstrap/react-native-template/pull/58)).

## Environments, EAS and CI

- **QA environment.** A fourth environment next to development, staging and production, with its own `.env.qa`, `pnpm` scripts, EAS build and submit profiles, bundle identifier suffix and GitHub environment ([#25](https://github.com/rootstrap/react-native-template/pull/25)).
- **Environment files from EAS secrets.** When building on EAS, `env.js` reads the environment file from a file-type secret (`ENVIRONMENT_FILE_<ENV>`), and the validation error messages explain what is missing and where ([#39](https://github.com/rootstrap/react-native-template/pull/39)). `EAS.md` documents how to upload them ([#60](https://github.com/rootstrap/react-native-template/pull/60), [#87](https://github.com/rootstrap/react-native-template/pull/87)).
- **Expo web scripts.** `web:<env>` and `build:<env>:web` scripts run and export the app for the web with the right environment variables ([#56](https://github.com/rootstrap/react-native-template/pull/56)).
- **Environment files are not tracked by Git.** Only `.env.sample` is committed; real `.env.*` files stay local ([#10](https://github.com/rootstrap/react-native-template/pull/10)).
- **Build & Deploy workflow.** A manually triggered workflow that maps the current branch to an environment, optionally bumps the app version, runs the EAS build locally on GitHub-hosted runners (so the EAS build quota is not consumed), prebuilds only the selected platform and can auto-submit to the stores ([#49](https://github.com/rootstrap/react-native-template/pull/49), [#124](https://github.com/rootstrap/react-native-template/pull/124), [#141](https://github.com/rootstrap/react-native-template/pull/141), [#145](https://github.com/rootstrap/react-native-template/pull/145), [#150](https://github.com/rootstrap/react-native-template/pull/150)).
- **SonarQube analysis** on pull requests and on pushes to the main branches, with Jest coverage reports and a quality gate ([#12](https://github.com/rootstrap/react-native-template/pull/12), [#46](https://github.com/rootstrap/react-native-template/pull/46)).
- **Merge conflict check** workflow that fails a pull request when unresolved conflict markers are committed ([#80](https://github.com/rootstrap/react-native-template/pull/80)).

See the [workflows reference](/ci-cd/workflows-references/) for the full list of GitHub Actions included in the template.

## Code quality and tooling

- **Stricter ESLint rules** layered on top of the shared `@antfu/eslint-config` flat config: `no-nested-ternary`, `no-unneeded-ternary`, `prefer-template`, `curly`, `guard-for-in`, `max-params`, a lower `max-lines-per-function` limit, `ts/no-magic-numbers`, `ts/no-explicit-any` as an error, `import-x/no-cycle`, plus React rules such as `jsx-shorthand-fragment`, `no-useless-fragment` and `no-children-prop` ([#67](https://github.com/rootstrap/react-native-template/pull/67), [#72](https://github.com/rootstrap/react-native-template/pull/72), [#73](https://github.com/rootstrap/react-native-template/pull/73), [#107](https://github.com/rootstrap/react-native-template/pull/107), [#121](https://github.com/rootstrap/react-native-template/pull/121), [#147](https://github.com/rootstrap/react-native-template/pull/147)).
- **NativeWind `rem` size set to 16** to match web sizing and 4px-based design grids ([#135](https://github.com/rootstrap/react-native-template/pull/135)).
- **i18n Ally custom framework config** so the VS Code extension shows inline translations for `translate()` calls and `text` / `title` props ([#104](https://github.com/rootstrap/react-native-template/pull/104)).
- **Tests live in `__tests__/`**, mirroring the `src/` structure instead of sitting next to the source files ([#138](https://github.com/rootstrap/react-native-template/pull/138)).
- **Pull request template** with a ticket reference, "what / why / impact" sections, a risk classification table and screenshot placeholders, plus a `CODEOWNERS` file ([#1](https://github.com/rootstrap/react-native-template/pull/1), [#2](https://github.com/rootstrap/react-native-template/pull/2), [#122](https://github.com/rootstrap/react-native-template/pull/122)).
- **Pushgate pre-push checks.** A committed `.pushgate.yml` runs type checking, linting, translation linting and tests before every `git push`; the CLI installs the hook in new projects ([#154](https://github.com/rootstrap/react-native-template/pull/154)).
- **Risk labels and gatekeeper script.** `risk:*` labels classify pull requests, and an optional `layer4-gatekeeper` workflow turns them into a required number of approvals ([#154](https://github.com/rootstrap/react-native-template/pull/154)).

## Coding assistants

- **`AGENTS.md`, `REVIEW.md` and `agent_docs/`** describe the architecture, conventions, commands and review checklist for anyone (or any tool) working in the codebase; the CLI rewrites the template-specific parts for new projects ([#144](https://github.com/rootstrap/react-native-template/pull/144), [#148](https://github.com/rootstrap/react-native-template/pull/148)).
- **Editor rules, skills and prompts.** Cursor rules under `.cursor/rules`, reusable skills under `.agents/skills` and `.claude/skills` (pull request description, review changes) and ready-to-use prompts under `prompts/` ([#123](https://github.com/rootstrap/react-native-template/pull/123), [#144](https://github.com/rootstrap/react-native-template/pull/144)).
- **Rootstrap `rn-toolkit` plugin.** When Claude Code is available, the CLI installs our React Native toolkit plugin in the generated project ([#156](https://github.com/rootstrap/react-native-template/pull/156)).
- **SonarQube MCP server** configured in `.mcp.json` so editors can query the Sonar analysis for the project.
- **GPT review bot instructions** in the README for enabling [rs-gpt-review](https://github.com/rootstrap/rs-gpt-review) on pull requests ([#30](https://github.com/rootstrap/react-native-template/pull/30)).

## Keeping the template and your projects up to date

- **Sync with upstream.** A scheduled workflow checks the latest Obytes release (or a specific version when run manually), merges it into a branch, drops the files we intentionally diverge on and opens a pull request for review ([#33](https://github.com/rootstrap/react-native-template/pull/33), [#100](https://github.com/rootstrap/react-native-template/pull/100)).
- **Sync with template.** Projects created with the CLI get a `sync-with-template` workflow that opens a pull request whenever a new template release is published, so client apps can adopt improvements incrementally ([#86](https://github.com/rootstrap/react-native-template/pull/86), [#100](https://github.com/rootstrap/react-native-template/pull/100)).
- **Template releases.** A manual "New Template Version" workflow bumps the version, tags the release and publishes it ([#36](https://github.com/rootstrap/react-native-template/pull/36), [#51](https://github.com/rootstrap/react-native-template/pull/51)).
- **Documentation deploys.** This site is deployed to GitHub Pages automatically when a release is published ([#3](https://github.com/rootstrap/react-native-template/pull/3), [#70](https://github.com/rootstrap/react-native-template/pull/70), [#105](https://github.com/rootstrap/react-native-template/pull/105)).

:::tip
Curious about a change that is not listed here? The [merged pull requests](https://github.com/rootstrap/react-native-template/pulls?q=is%3Apr+is%3Amerged) in the template repository contain the full description and rationale of every change.
:::
