# Commands

All commands use `pnpm`. Never use `npm` or `yarn` — the `preinstall` hook will block them.

---

## Development

| Command                  | Description                                       |
| ------------------------ | ------------------------------------------------- |
| `pnpm start`             | Start Expo dev server (no dotenv injection)       |
| `pnpm start:development` | Start with `APP_ENV=development`                  |
| `pnpm start:qa`          | Start with `APP_ENV=qa`                           |
| `pnpm start:staging`     | Start with `APP_ENV=staging`                      |
| `pnpm start:production`  | Start with `APP_ENV=production`                   |
| `pnpm ios`               | Run on iOS simulator                              |
| `pnpm android`           | Run on Android emulator                           |
| `pnpm web`               | Start Expo web (with cache reset)                 |
| `pnpm xcode`             | Open the iOS project in Xcode (`xed -b ios`)      |
| `pnpm prebuild`          | Generate native `ios/` and `android/` directories |

---

## Testing

| Command                | Description                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `pnpm test`            | Run the full Jest unit test suite                                                                                   |
| `pnpm test:watch`      | Run Jest in watch mode                                                                                              |
| `pnpm test:ci`         | Run Jest with coverage (used in CI)                                                                                 |
| `pnpm e2e-test`        | Run Maestro E2E tests against `.maestro/` (requires a running device/emulator with `APP_ID=com.obytes.development`) |
| `pnpm install-maestro` | Install the Maestro CLI locally                                                                                     |

---

## Quality gates

Run these before opening a PR. The pre-commit hook runs `pnpm type-check` and `pnpm lint-staged` automatically.

| Command                  | Description                                                         |
| ------------------------ | ------------------------------------------------------------------- |
| `pnpm type-check`        | TypeScript strict check (`tsc --noemit`)                            |
| `pnpm lint`              | ESLint across all `.js`, `.jsx`, `.ts`, `.tsx` files                |
| `pnpm lint:translations` | ESLint on `src/translations/` to catch missing or invalid i18n keys |
| `pnpm check-all`         | Runs lint + type-check + lint:translations + test in sequence       |

---

## Build (EAS)

Builds are created with Expo Application Services. Always set `APP_ENV` via the environment-specific script variants.

| Command                          | Description                              |
| -------------------------------- | ---------------------------------------- |
| `pnpm build:development:ios`     | EAS build — development profile, iOS     |
| `pnpm build:development:android` | EAS build — development profile, Android |
| `pnpm build:qa:ios`              | EAS build — QA profile, iOS              |
| `pnpm build:qa:android`          | EAS build — QA profile, Android          |
| `pnpm build:staging:ios`         | EAS build — staging profile, iOS         |
| `pnpm build:staging:android`     | EAS build — staging profile, Android     |
| `pnpm build:production:ios`      | EAS build — production profile, iOS      |
| `pnpm build:production:android`  | EAS build — production profile, Android  |
| `pnpm submit:development:mobile` | EAS submit — development profile         |

---

## Setup

| Command        | Description                                                         |
| -------------- | ------------------------------------------------------------------- |
| `pnpm install` | Install all dependencies                                            |
| `pnpm prepare` | Install Husky git hooks (run after `pnpm install` on a fresh clone) |
| `pnpm doctor`  | Run `expo-doctor` to check for SDK/dependency compatibility issues  |
