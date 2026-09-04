#!/usr/bin/env node

const { consola } = require('consola');
const { showMoreDetails } = require('./utils.js');
const { cloneLatestTemplateRelease } = require('./clone-repo.js');
const { setupProject, installDependencies } = require('./setup-project.js');
const { installClaudeToolkit } = require('./install-claude-plugin.js');
const pkg = require('./package.json');

const { name: packageName } = pkg;
const createRootstrapApp = async () => {
  consola.box("Rootstrap's React Native Template\nPerfect React Native App Kickstart 🚀!");
  // get project name from command line
  const projectName = process.argv[2];
  // check if project name is provided
  if (!projectName) {
    consola.error(
      `Please provide a name for your project: \`npx ${packageName}@latest <project-name>\``
    );
    process.exit(1);
  }
  // clone the latest release of the template from github
  await cloneLatestTemplateRelease(projectName);

  // setup the project
  await setupProject(projectName);

  // install project dependencies using pnpm
  await installDependencies(projectName);

  // install the Rootstrap rn-toolkit Claude Code plugin
  await installClaudeToolkit(projectName);

  // show instructions to run the project + link to the documentation
  showMoreDetails(projectName);
};

createRootstrapApp();
