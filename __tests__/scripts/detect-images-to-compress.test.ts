import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SCRIPT = path.resolve(
  __dirname,
  '../../.github/scripts/detect-images-to-compress.sh',
);
const ZERO_SHA = '0000000000000000000000000000000000000000';

type Outputs = Record<string, string>;

// Parses the "name=value" lines the script appends to $GITHUB_OUTPUT.
const parseOutputs = (content: string): Outputs =>
  Object.fromEntries(
    content
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf('=');
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );

const createRepo = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'detect-images-'));
  const git = (...args: string[]) =>
    execFileSync(
      'git',
      [
        '-c',
        'user.name=Test',
        '-c',
        'user.email=test@example.com',
        '-c',
        'commit.gpgsign=false',
        ...args,
      ],
      { cwd: dir, encoding: 'utf8' },
    ).trim();

  const write = (file: string, content = file) => {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), content);
  };

  const commit = (message: string, files: Record<string, string>) => {
    Object.entries(files).forEach(([file, content]) => write(file, content));
    git('add', '-A');
    git('commit', '-q', '-m', message);
    return git('rev-parse', 'HEAD');
  };

  const detect = (before: string, after = git('rev-parse', 'HEAD')) => {
    const outputFile = path.join(dir, '.git', 'github-output');
    fs.writeFileSync(outputFile, '');
    execFileSync('bash', [SCRIPT], {
      cwd: dir,
      encoding: 'utf8',
      env: {
        ...process.env,
        BEFORE: before,
        AFTER: after,
        IGNORE_PATHS: 'node_modules/**,ios/**,android/**',
        COMPRESS_COMMIT_MESSAGE: 'Compress Images',
        COMPRESS_PR_TITLE: 'Auto Compress Images',
        GITHUB_OUTPUT: outputFile,
      },
    });
    return parseOutputs(fs.readFileSync(outputFile, 'utf8'));
  };

  git('init', '-q', '-b', 'master');
  const base = commit('Initial commit', {
    'assets/icon.png': 'icon',
    'docs/public/screen.png': 'screen',
    'README.md': 'readme',
  });

  return { dir, git, commit, detect, base };
};

type Repo = ReturnType<typeof createRepo>;

const ignoredPaths = (outputs: Outputs) =>
  outputs['ignore-paths'].split(',');

let repo: Repo;

beforeEach(() => {
  repo = createRepo();
});

afterEach(() => {
  fs.rmSync(repo.dir, { recursive: true, force: true });
});

describe('detect-images-to-compress: images added by people', () => {
  it('selects only the new image and ignores everything else', () => {
    repo.commit('feat: add splash', { 'assets/splash.png': 'splash' });

    const outputs = repo.detect(repo.base);

    expect(outputs.skip).toBe('false');
    expect(ignoredPaths(outputs)).toEqual([
      'node_modules/**',
      'ios/**',
      'android/**',
      'assets/icon.png',
      'docs/**',
    ]);
  });

  it('skips when no image changed', () => {
    repo.commit('docs: update readme', { 'README.md': 'new readme' });

    expect(repo.detect(repo.base)).toEqual({ skip: 'true' });
  });

  it('skips images inside ignored directories', () => {
    repo.commit('chore: add native icon', { 'ios/icon.png': 'ios icon' });

    expect(repo.detect(repo.base)).toEqual({ skip: 'true' });
  });

  it('replaces glob characters and commas in ignored names', () => {
    repo.commit('feat: add images', {
      'assets/a[1],b.png': 'odd name',
      'assets/new.png': 'new',
    });
    repo.commit('Compress Images', { 'assets/a[1],b.png': 'compressed' });

    expect(ignoredPaths(repo.detect(repo.base))).toContain(
      'assets/a?1??b.png',
    );
  });
});

describe('detect-images-to-compress: compression commits', () => {
  it('skips images whose compression PR was merged with a merge commit', () => {
    repo.git('checkout', '-q', '-b', 'create-pull-request/patch');
    repo.commit('Compress Images', { 'assets/icon.png': 'compressed icon' });
    repo.git('checkout', '-q', 'master');
    repo.git(
      'merge',
      '-q',
      '--no-ff',
      '-m',
      'Merge pull request #12',
      'create-pull-request/patch',
    );

    expect(repo.detect(repo.base)).toEqual({ skip: 'true' });
  });

  it.each(['Compress Images (#12)', 'Auto Compress Images (#12)'])(
    'skips images whose compression PR was squashed as "%s"',
    (title) => {
      repo.commit(title, { 'assets/icon.png': 'compressed icon' });

      expect(repo.detect(repo.base)).toEqual({ skip: 'true' });
    },
  );

  it('selects an image changed by people after its compression', () => {
    repo.commit('Compress Images (#12)', {
      'assets/icon.png': 'compressed icon',
    });
    repo.commit('feat: new icon', { 'assets/icon.png': 'new icon' });

    expect(repo.detect(repo.base).skip).toBe('false');
  });

  it('selects an image that only a merge commit added', () => {
    repo.git('checkout', '-q', '-b', 'feature');
    repo.commit('docs: update readme', { 'README.md': 'feature readme' });
    repo.git('checkout', '-q', 'master');
    repo.git('merge', '-q', '--no-ff', '--no-commit', 'feature');
    repo.commit('Merge branch feature', { 'assets/merged.png': 'merged' });

    const outputs = repo.detect(repo.base);

    expect(outputs.skip).toBe('false');
    expect(ignoredPaths(outputs)).not.toContain('assets/merged.png');
  });

  it('keeps file names intact when a subject contains a tab', () => {
    repo.commit('feat:\tadd splash', { 'assets/splash.png': 'splash' });

    const outputs = repo.detect(repo.base);

    expect(outputs.skip).toBe('false');
    expect(ignoredPaths(outputs)).toContain('assets/icon.png');
    expect(ignoredPaths(outputs)).not.toContain('assets/splash.png');
  });

  it('selects images whose subject only mentions compression', () => {
    repo.commit('Compress Images manually', {
      'assets/icon.png': 'smaller icon',
    });

    expect(repo.detect(repo.base).skip).toBe('false');
  });
});

describe('detect-images-to-compress: first and force pushes', () => {
  it('inspects the whole history on the first push', () => {
    repo.commit('Compress Images', { 'assets/icon.png': 'compressed icon' });

    const outputs = repo.detect(ZERO_SHA);

    expect(outputs.skip).toBe('false');
    expect(ignoredPaths(outputs)).toContain('assets/**');
    expect(ignoredPaths(outputs)).not.toContain('docs/**');
  });

  it('inspects the whole history after a force push', () => {
    const rewritten = repo.commit('feat: temporary', {
      'assets/tmp.png': 'tmp',
    });
    repo.git('reset', '-q', '--hard', repo.base);
    repo.commit('Compress Images', {
      'assets/icon.png': 'compressed icon',
      'docs/public/screen.png': 'compressed screen',
    });

    expect(repo.detect(rewritten)).toEqual({ skip: 'true' });
  });
});
