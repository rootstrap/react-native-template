<h1 align="center">
  <img alt="logo" src="./assets/RootstrapIcon.jpg" width="124px" style="border-radius:10px"/><br/>
Mobile App </h1>

> This Project is based on [Rootstrap React Native Template](https://github.com/rootstrap/react-native-template)

## Requirements

- [React Native dev environment](https://reactnative.dev/docs/environment-setup)
- [Node.js](https://nodejs.org/en/) (version specified in `.nvmrc`)
- [Git](https://git-scm.com/)
- [Watchman](https://facebook.github.io/watchman/docs/install#buildinstall), required only for macOS or Linux users
- [Pnpm](https://pnpm.io/installation)
- [Cursor](https://www.cursor.com/) or [VS Code Editor](https://code.visualstudio.com/download) ⚠️ Make sure to install all recommended extension from `.vscode/extensions.json`

### Node.js Version Management

This project uses a `.nvmrc` file to specify the recommended Node.js version. We recommend using a Node.js version manager such as [fnm](https://github.com/Schniz/fnm) or [nvm](https://github.com/nvm-sh/nvm) to ensure you're using the correct version:

**With fnm:**
```sh
fnm install
fnm use
```

**With nvm:**
```sh
nvm install
nvm use
```

The version manager will automatically read the `.nvmrc` file and switch to the correct Node.js version.

## 👋 Quick start

Clone the repo to your machine and install deps :

```sh
git clone https://github.com/user/repo-name

cd ./repo-name

pnpm install
```

To run the app on ios

```sh
pnpm ios
```

To run the app on Android

```sh
pnpm android
```

To build your app locally you can run any of the build scripts with --local.

`pnpm build:development:ios --local`

## Pushgate

This repository uses `ai-pushgate` to run local checks before `git push`.

How this relates to PR approvals:
- Pushgate is a local pre-push gate run from the Git pre-push hook.
- PR approval calculation is handled separately by the Layer 4 gatekeeper workflow script at `.github/scripts/gatekeeper.js`.
- Pushgate can help classify AI findings, while gatekeeper turns `risk:*` + `ai:*` labels into required approvals.

Pushgate setup for template users:
- `.pushgate.yml` is versioned, so everyone gets the same rules.
- `.git/hooks/pre-push` is local and is not committed to Git.
- If you create the app with `create-rootstrap-rn-app`, Pushgate is installed automatically during setup.
- For existing clones, or if the hook is missing, install it manually:

Install from repo root:
```sh
curl -fsSL https://raw.githubusercontent.com/rootstrap/ai-pushgate/main/install.sh | bash
```

Verify the hook was created:
```sh
ls .git/hooks/pre-push
```

How to skip checks:
> Skip AI only: `git -c pushgate.skip-ai-check=true push`
> Skip everything: `git push --no-verify`

## Layer 4 Gatekeeper Approval Calculation

The gatekeeper script computes required approvals from PR labels using this routing table:

| Risk \ AI findings | `ai:clean` | `ai:minor` | `ai:serious` |
| --- | ---: | ---: | ---: |
| `risk:low` | 0 | 0 | 1 |
| `risk:medium` | 0 | 1 | 2 |
| `risk:high` | 1 | 2 | 2 |

Decision rules implemented in `.github/scripts/gatekeeper.js`:
- Missing `risk:*` or `ai:*` label -> status is `pending`.
- `required approvals = 0` -> status is `success` (auto-merge allowed by this check).
- Otherwise status is `success` only when current approvals >= required approvals; else `pending`.
- Approval count uses the latest review state per reviewer, and counts only `APPROVED`.

Workflow file: `.github/workflows/layer4-gatekeeper.disabled.yml` (rename/enable it in your repo if you want this check active).

## PR Risk Classification

This repository uses a simple `risk:*` label system when opening pull requests.

| Label | When to use |
| --- | --- |
| `risk:low` | Config, copy, minor UI tweaks with low blast radius. |
| `risk:medium` | Feature work and refactors touching multiple files. |
| `risk:high` | Auth, payments, migrations, and security-sensitive code. |

Before requesting review, apply the label that best matches the change. When in doubt, escalate instead of guessing.

Setup checklist:
- Create `risk:low`, `risk:medium`, and `risk:high` labels in the repo.
- Keep the risk criteria documented in the PR template or contributing guide.
- Define who can override or escalate the label, such as the tech lead.

### SonarQube setup

SonarQube is an open-source platform for continuous inspection of code quality. It performs automatic reviews to detect bugs, code smells, and security vulnerabilities. Rootstrap has a SonarQube instance to improve the quality of the software we develop. On each PR, a GitHub Action is triggered to perform the analysis. To set up SonarQube correctly, you need to add the `SONAR_TOKEN`, `SONAR_URL`, and `SONAR_PROJECT` secrets to the repository. Additionally, you must select the quality gate named `ReactNativeTemplate` for your project on SonarQube. In case you're using this project outside Rootstrap and you're not planning to use SonarQube the sonar scanner [workflow](.github/workflows/sonar.yml) should be deleted.

## ✍️ Documentation

- [Rules and Conventions](https://rootstrap.github.io/react-native-template/getting-started/rules-and-conventions/)
- [Project structure](https://rootstrap.github.io/react-native-template/getting-started/project-structure)
- [Environment vars and config](https://rootstrap.github.io/react-native-template/getting-started/environment-vars-config)
- [UI and Theming](https://rootstrap.github.io/react-native-template/ui-and-theme/ui-theming)
- [Components](https://rootstrap.github.io/react-native-template/ui-and-theme/components)
- [Forms](https://rootstrap.github.io/react-native-template/ui-and-theme/forms/)
- [Data fetching](https://rootstrap.github.io/react-native-template/guides/data-fetching)
- [Contribute to starter](https://rootstrap.github.io/react-native-template/how-to-contribute/)
- [Distribute using EAS](/EAS.md)
