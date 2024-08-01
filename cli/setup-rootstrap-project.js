#!/usr/bin/env node

const { execShellCommand, runCommand } = require('./utils.js');
const { consola } = require('consola');
const fs = require('fs-extra');
const path = require('path');
const { removeScript } = require('./setup-project.js');

const initGit = async () => {
  await execShellCommand('git init');
};

const installDeps = async () => {
  await runCommand('pnpm install', {
    loading: 'Installing  project dependencies',
    success: 'Dependencies installed',
    error: 'Failed to install dependencies, Make sure you have pnpm installed',
  });
};

// remove unnecessary files, such us .git, ios, android, docs, cli, LICENSE
const removeFiles = async () => {
  const FILES_TO_REMOVE = [
    '.git',
    'README.md',
    'ios',
    'android',
    'docs',
    'cli',
    'LICENSE'
  ];

  FILES_TO_REMOVE.forEach((file) => {
    fs.removeSync(path.join(process.cwd(), file));
  });
};

// Update package.json infos, name and  set version to 0.0.1 + add initial version to osMetadata
const updatePackageInfos = async (projectName) => {
  const packageJsonPath = path.join(
    process.cwd(),
    'package.json'
  );
  const packageJson = fs.readJsonSync(packageJsonPath);
  packageJson.osMetadata = { initVersion: packageJson.version };
  packageJson.version = '0.0.1';
  packageJson.name = projectName?.toLowerCase();
  packageJson.repository = {
    type: 'git',
    url: 'git+https://github.com/user/repo-name.git',
  };
  fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });
};

const updateProjectConfig = async (projectName) => {
  const configPath = path.join(process.cwd(), 'env.js');
  const contents = fs.readFileSync(configPath, {
    encoding: 'utf-8',
  });
  const replaced = contents
    .replace(/ObytesApp/gi, projectName)
    .replace(/com.obytes/gi, `com.${projectName.toLowerCase()}`)
    .replace(/obytes/gi, 'expo-owner');

  fs.writeFileSync(configPath, replaced, { spaces: 2 });
  const readmeFilePath = path.join(
    process.cwd(),
    'README-project.md'
  );
  fs.renameSync(
    readmeFilePath,
    path.join(process.cwd(), 'README.md')
  );
};

const setupProject = async () => {
  consola.box('Rootstrap React Native Starter 🚀!');
  // get project name from command line
  const projectName = process.argv[2];
  // check if project name is provided
  if (!projectName) {
    consola.error(
      'Please provide a name for your project: `pnpm setup-project <project-name>`'
    );
    process.exit(1);
  }
  consola.start('Clean up and setup your project 🧹');
  try {
    removeFiles();
    initGit()
    updatePackageInfos(projectName);
    updateProjectConfig(projectName);
    const projectPath = process.cwd();
    removeScript(projectPath, 'setup-project')
    consola.success('Clean up and setup your project 🧹');
  } catch (error) {
    consola.error('Failed to clean up project folder', error);
    process.exit(1);
  }
};

setupProject()