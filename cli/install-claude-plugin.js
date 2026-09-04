const { exec } = require('node:child_process');
const { consola } = require('consola');

const MARKETPLACE_REPOSITORY = 'rootstrap/rn-claude-toolkit';
const MARKETPLACE_NAME = 'rootstrap';
const PLUGIN_NAME = 'rn-toolkit';

// Quiet variant of execShellCommand: failures here are expected and handled
const run = (cmd, options) =>
  new Promise((resolve, reject) => {
    exec(cmd, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout || stderr);
    });
  });

const isClaudeCodeAvailable = async () => {
  try {
    await run('claude --version');
    return true;
  } catch {
    return false;
  }
};

const installClaudeToolkit = async (projectName) => {
  if (!(await isClaudeCodeAvailable())) {
    consola.info(
      `Claude Code CLI not found, skipping ${PLUGIN_NAME} plugin installation.\n` +
        `   Install it later from the project root with: claude plugin marketplace add ${MARKETPLACE_REPOSITORY} --scope project && claude plugin install ${PLUGIN_NAME}@${MARKETPLACE_NAME} --scope project`
    );
    return;
  }

  consola.start(`Installing the ${PLUGIN_NAME} Claude Code plugin 🤖`);
  try {
    await run(
      `claude plugin marketplace add ${MARKETPLACE_REPOSITORY} --scope project && claude plugin install ${PLUGIN_NAME}@${MARKETPLACE_NAME} --scope project`,
      { cwd: projectName }
    );
    consola.success(`${PLUGIN_NAME} plugin installed`);
  } catch {
    consola.warn(
      `Could not install the ${PLUGIN_NAME} plugin. The marketplace repository is private, ` +
        `so you need git access to ${MARKETPLACE_REPOSITORY} as a member of the Rootstrap org.\n` +
        `   Retry from the project root with: claude plugin marketplace add ${MARKETPLACE_REPOSITORY} --scope project && claude plugin install ${PLUGIN_NAME}@${MARKETPLACE_NAME} --scope project`
    );
  }
};

module.exports = {
  installClaudeToolkit,
};
