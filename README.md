<p align="center">
    <img alt="Rootstrap's React Native Template" src="https://github.com/user-attachments/assets/2015cb3f-64ab-4ccd-b85f-ca77f73686eb" width="200" />
</p>

<h1 align="center">
  Rootstrap's React Native Template
</h1>

![expo](https://img.shields.io/github/package-json/dependency-version/rootstrap/react-native-template/expo?label=expo) ![react-native](https://img.shields.io/github/package-json/dependency-version/rootstrap/react-native-template/react-native?label=react-native) ![GitHub Repo stars](https://img.shields.io/github/stars/rootstrap/react-native-template) ![GitHub commit activity (branch)](https://img.shields.io/github/commit-activity/m/rootstrap/react-native-template) ![GitHub issues](https://img.shields.io/github/issues/rootstrap/react-native-template) ![GitHub closed issues](https://img.shields.io/github/issues-closed-raw/rootstrap/react-native-template)

📱 A template for your next React Native project 🚀, Made with developer experience and performance first: Expo, TypeScript, NativeWind, Husky, Lint-Staged, expo-router, react-query, react-hook-form, I18n and preconfigured for EAS.

This repository is a fork of [Obytes Starter](https://github.com/obytes/react-native-template-obytes), which provides a solid foundation. We periodically sync with the original repo to stay up-to-date with their improvements, while making our own adjustments and optimizations to streamline our setup process.

<<<<<<< HEAD
# Overview

As a team of experienced developers at Rootstrap, we have spent years building high-quality React Native applications. Our initial starter kit was designed for React Native CLI apps. However, with the strong recommendation to work with Expo since React Native 0.75, we recognized the need to adapt quickly and leverage the best tools available.

To maintain our commitment to delivering top-quality products efficiently, we chose to explore and research existing templates maintained by a larger community.

Our objective with this template is to streamline the development process, enabling us to build high-quality apps more efficiently and with less overhead.

This template brings several key advantages. It provides our team with a consistent codebase and standards, making it easier to move between projects without a steep learning curve. This consistency allows us to focus more on the core functionality of each project instead of getting stuck on repetitive setup tasks. Furthermore, by promoting uniformity across our work, it simplifies maintenance, scaling, and collaboration across different teams.

## ⭐ Key Features

- 🎉 [TypeScript](https://www.typescriptlang.org/) for type checking, to help you catch bugs and improve code quality.
- 💅 A minimal UI kit built with [NativeWind](https://www.nativewind.dev/), which provides a range of pre-defined classes for styling your app.
- ⚙️ Support for multiple environment builds, including Production, Staging, QA and Development, using Expo configuration.
- 🦊 Husky for Git Hooks, to automate your git hooks and enforce code standards.
- 💡 A clean project structure with Absolute Imports, to make it easier to navigate and manage your code.
- 🚫 Lint-staged for running ESLint and TypeScript checks on Git staged files, to ensure that your code is always up to standards.
- 🗂 VSCode recommended extensions, settings, and snippets to enhance the developer experience.
- ☂️ Pre-installed [Expo Router](https://docs.expo.dev/router/introduction/) with examples, to provide a comprehensive navigation solution for your app.
- 💫 An auth flow with [zustand](https://github.com/pmndrs/zustand) and [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv) as a storage solution to save sensitive data.
- 🛠 +10 workflows for building, releasing, testing and distributing your app using [Github action](https://github.com/features/actions).
- 🔥 [React Query](https://react-query.tanstack.com/) and [axios](https://github.com/axios/axios) for fetching data, to help you build efficient and performant apps.
- 🧵 A good approach for handling forms with [react-hook-form](https://react-hook-form.com/) and [zod](https://github.com/colinhacks/zod) for validation + keyboard handling.
- 🎯 Localization with [i18next](https://www.i18next.com/), along with Eslint for validation.
- Unit testing with [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) setup to help you write tests for your app.

## ✍️ Documentation 🚧 UNDER CONSTRUCTION 🚧

- [Create new project ](https://rootstrap.github.io/react-native-template/getting-started/create-new-app/)
- [Rules and Conventions](https://rootstrap.github.io/react-native-template/getting-started/rules-and-conventions/)
- [Project structure](https://rootstrap.github.io/react-native-template/getting-started/project-structure/)
- [Environment vars and config](https://rootstrap.github.io/react-native-template/getting-started/environment-vars-config/)
- [UI and Theming](https://rootstrap.github.io/react-native-template/ui-and-theme/ui-theming/)
- [Components](https://rootstrap.github.io/react-native-template/ui-and-theme/components/)
- [Forms](https://rootstrap.github.io/react-native-template/ui-and-theme/forms/)
- [Data fetching](https://rootstrap.github.io/react-native-template/guides/data-fetching/)
- [Contribute to starter](https://rootstrap.github.io/react-native-template/how-to-contribute/)
=======
> Welcome to the Obytes Mobile Tribe's Expo / React Native Starter Kit!

## 🚀 Motivation

Our goal with this starter kit was to streamline the process of building React Native apps, both for our own team and for our clients. We wanted to create a resource that would allow us to create high-quality apps faster and with less effort, while ensuring that all of our projects adhere to the same code standards and architectural principles.

The benefits of using this starter kit are numerous. It helps our team easily switch between projects, as we can rely on a consistent foundation of code. It also allows us to focus on the business logic of each project rather than getting bogged down in boilerplate code. And, because it promotes consistency across projects, it makes it easier to maintain and scale our apps, as well as share code between teams.

Overall, our starter kit is designed to facilitate efficient and effective app development, helping us to bring the best possible products to our clients

## ✍️ Philosophy

When creating this starter kit, we had several guiding principles in mind::

- **🚀 Production-ready**: We wanted to ensure that this starter was ready for real-world use, providing a solid foundation for building production-grade apps.
- **🥷 Developer experience and productivity**: Our focus was on creating a starter that would enhance the developer experience and increase productivity.
- **🧩 Minimal code and dependencies**: We aimed to keep the codebase and dependencies as small as possible.
- **💪 Well-maintained third-party libraries**: We included only well-maintained and reliable third-party libraries, to provide stability and support for our projects.

## ⭐ Key Features

- ✅ Latest Expo SDK with Custom Dev Client: Leverage the best of the Expo ecosystem while maintaining full control over your app.
- 🎉 [TypeScript](https://www.typescriptlang.org/) for enhanced code quality and bug prevention through static type checking.
- 💅 Minimal UI kit built with [TailwindCSS](https://www.nativewind.dev/), featuring common components essential for your app.
- ⚙️ Multi-environment build support (Production, Staging, Development) using Expo configuration.
- 🦊 Husky for Git Hooks: Automate your git hooks and enforce code standards.
- 💡 Clean project structure with Absolute Imports for easier code navigation and management.
- 🚫 Lint-staged: Run Eslint and TypeScript checks on Git staged files to maintain code quality.
- 🗂 VSCode recommended extensions, settings, and snippets for an enhanced developer experience.
- ☂️ Pre-installed [Expo Router](https://docs.expo.dev/router/introduction/) with examples for comprehensive app navigation.
- 💫 Auth flow implementation using [Zustand](https://github.com/pmndrs/zustand) for state management and [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv) for secure data storage.
- 🛠 10+ [Github Actions](https://github.com/features/actions) workflows for building, releasing, testing, and distributing your app.
- 🔥 [React Query](https://react-query.tanstack.com/) and [axios](https://github.com/axios/axios) for efficient data fetching and state management.
- 🧵 Robust form handling with [react-hook-form](https://react-hook-form.com/) and [zod](https://github.com/colinhacks/zod) for validation, plus keyboard handling.
- 🎯 Localization support with [i18next](https://www.i18next.com/), including Eslint for validation.
- 🧪 Unit testing setup with [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).
- 🔍 E2E testing capabilities with [Maestro](https://maestro.mobile.dev/) for comprehensive app testing.

## Is this starter for me?

Yes 😀

This starter kit is designed to benefit a wide range of React Native developers, from beginners to experienced professionals. Here's why it might be a good fit for you:

1. **For beginners:** It provides a solid foundation with best practices and common solutions, helping you learn industry-standard approaches to React Native development.

2. **For experienced developers:** It offers a well-structured, production-ready setup that can save you time and effort in project initialization and configuration.

3. **For teams:** It ensures consistency across projects and team members, making it easier to onboard new developers and maintain code quality.

4. **For explorers:** Even if you prefer not to use starter kits, this project can serve as a valuable reference. You can explore the codebase, documentation, and architectural decisions to gain insights and potentially adopt specific solutions for your projects.

5. **For learners:** The starter kit incorporates up-to-date libraries and patterns, allowing you to familiarize yourself with current best practices in the React Native ecosystem.

6. **For AI-assisted development:** This starter kit works well with AI coding tools. It provides a solid structure and best practices that can guide AI-generated code. This helps ensure that AI assistance leads to high-quality, maintainable code that fits well within your project.

Remember, you don't have to use the entire starter kit as-is. Feel free to cherry-pick ideas, configurations, or code snippets that align with your project needs. Whether you're building a new app from scratch or looking to improve your existing development process, this starter kit can provide valuable insights and practical solutions.

## Why Expo and not React Native CLI?

We have been using Expo as our main framework since the introduction of [Continuous Native Generation (CNG)](https://docs.expo.dev/workflow/continuous-native-generation/) concept and we are happy with the experience.

I think this question is not valid anymore, especially after the last React conference when the core React native team recommended using Expo for new projects.

> "As of today, the only recommended community framework for React Native is Expo. Folks at Expo have been investing in the React Native ecosystem since the early days of React Native and as of today, we believe the developer experience offered by Expo is best in class." React native core team

Still hesitating? Check out this [article](https://reactnative.dev/blog/2024/06/25/use-a-framework-to-build-react-native-apps) or this [video](https://www.youtube.com/watch?v=lifGTznLBcw), maybe this one [video](https://www.youtube.com/watch?v=ek_IdGC0G80) too.
>>>>>>> 627e97c

## 🧑‍💻 Stay up to date

We are committed to continually improving our starter kit and providing the best possible resources for building React Native apps. To that end, we regularly add new features and fix any bugs that are discovered.

If you want to stay up to date with the latest developments in our starter kit, you can either watch the repository or hit the "star" button. This will allow you to receive notifications whenever new updates are available.

We value the feedback and contributions of our users, and we encourage you to let us know if you have any suggestions for improving our starter kit. We are always looking for ways to make it even more effective and useful for our community. So, please do not hesitate to reach out and share your thoughts with us.

## Add RS GPT Review Bot

You can add a GPT Review Bot to your app by following these steps:

- You need to have an OpenAI API key.
- Save your OpenAI API key as a Secret in your repository.
- Create a new workflow in folder .github/workflows that will be triggered on issues, pull requests, and comments.
- You can see examples of workflows in the [rs-gpt-review](https://github.com/rootstrap/rs-gpt-review) repository.

#### Notes:

The bot will be triggered on issues, pull requests and comments, you can modify your PULL_REQUEST_TEMPLATE.md to tag the review bot and trigger the workflow every time a pull request is created.

Check this [file](https://github.com/rootstrap/rs-gpt-review/blob/main/.github/workflows/main.yml) for more examples.

<!-- add a gif image here  -->

## 💎 Libraries used

- [Expo](https://docs.expo.io/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Nativewind](https://www.nativewind.dev/v4/overview)
- [Flash list](https://github.com/Shopify/flash-list)
- [React Query](https://tanstack.com/query/v4)
- [Axios](https://axios-http.com/docs/intro)
- [React Hook Form](https://react-hook-form.com/)
- [i18next](https://www.i18next.com/)
- [zustand](https://github.com/pmndrs/zustand)
- [React Native MMKV](https://github.com/mrousavy/react-native-mmkv)
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/docs/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/docs/)
- [React Native Svg](https://github.com/software-mansion/react-native-svg)
- [React Error Boundaries](https://github.com/bvaughn/react-error-boundary)
- [Expo Image](https://docs.expo.dev/versions/unversioned/sdk/image/)
- [React Native Keyboard Controller](https://github.com/kirillzyusko/react-native-keyboard-controller)
- [Moti](https://moti.fyi/)
- [React Native Safe Area Context](https://github.com/th3rdwave/react-native-safe-area-context)
- [React Native Screens](https://github.com/software-mansion/react-native-screens)
- [Tailwind Variants](https://www.tailwind-variants.org/)
- [Zod](https://zod.dev/)

## Contributors

This starter is maintained by Rootstrap React Native team and we welcome new contributors to join us in improving it. If you are interested in getting involved in the project, please don't hesitate to open an issue or submit a pull request.

## 🔖 License

This project is MIT licensed.
