const {
  runCommand,
  TEMPLATE_REPOSITORY,
  escapeShellArg,
} = require('./utils.js');
const { consola } = require('consola');

const getLatestRelease = async () => {
  try {
    const repoData = await fetch(
      `https://api.github.com/repos/${TEMPLATE_REPOSITORY}/releases/latest`
    );
    const releaseData = await repoData.json();
    return releaseData.tag_name || 'master';
  } catch (error) {
    console.warn(
      'Failed to retrieve the latest release; will use the master branch instead',
      error
    );
    return 'master';
  }
};

const cloneLatestTemplateRelease = async (projectName) => {
  consola.start('Extracting last release number 👀');
  const latestRelease = await getLatestRelease();
  consola.info(`Using Rootstrap's Template ${latestRelease}`);

  // create a new project based on Rootstrap template
  const escapedLatestRelease = escapeShellArg(latestRelease);
  const escapedProjectName = escapeShellArg(projectName);
  const cloneStarter = `git clone -b ${escapedLatestRelease} --depth=1 https://github.com/${TEMPLATE_REPOSITORY}.git ${escapedProjectName}`;
  await runCommand(cloneStarter, {
    loading: 'Extracting the template...',
    success: 'Template extracted successfully',
    error: 'Failed to download and extract template',
  });
};

module.exports = {
  cloneLatestTemplateRelease,
};
