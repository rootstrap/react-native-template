import { readdirSync } from 'node:fs';
import path from 'node:path';

import {
  APP_TAB_SCREENS,
  AUTH_SCREENS,
  AUTHENTICATED_SCREENS,
  isInAppPath,
  isOnScreen,
  isReturnToPath,
  toAppPath,
} from '@/lib/auth/deep-link-path';

describe('toAppPath', () => {
  it.each([
    ['RootstrapApp.development://feed/1', '/feed/1'],
    ['RootstrapApp://feed/1?ref=email', '/feed/1?ref=email'],
    ['RootstrapApp:///feed/1', '/feed/1'],
    ['https://example.com/feed/1#top', '/feed/1'],
    ['exp://127.0.0.1:8081/--/feed/1', '/feed/1'],
    ['/feed/1', '/feed/1'],
    ['feed/1', '/feed/1'],
    ['RootstrapApp://', '/'],
    ['', '/'],
  ])('turns %s into %s', (url, expected) => {
    expect(toAppPath(url)).toBe(expected);
  });

  it('unwraps a development client launch URL', () => {
    const launchUrl = `RootstrapApp://expo-development-client/?url=${encodeURIComponent('http://127.0.0.1:8081/--/feed/1')}`;

    expect(toAppPath(launchUrl)).toBe('/feed/1');
  });

  it('ignores a development client launch URL without a target', () => {
    expect(toAppPath('RootstrapApp://expo-development-client/')).toBe('/');
  });
});

describe('isInAppPath', () => {
  it.each(['/', '/feed/1', '/feed/1?ref=email', '/(app)/settings', '/..', '/feed/%2F%2Fexample.com'])(
    'accepts the in-app path %s',
    (path) => {
      expect(isInAppPath(path)).toBe(true);
    },
  );

  it.each([
    '',
    'feed/1',
    '//example.com/x',
    '///example.com/x',
    '/\\example.com/x',
    '\\\\example.com',
    '/feed\\..\\example.com',
    '/\t/example.com',
    '/feed /1',
    '/\u0000/example.com',
    'https://example.com/x',
    'javascript:alert(1)',
  ])('rejects %j as a redirect target', (path) => {
    expect(isInAppPath(path)).toBe(false);
  });
});

describe('isReturnToPath', () => {
  it.each([
    '/feed/1',
    '/feed/1?ref=email',
    '/settings',
    '/sign-in/../feed/1',
    '/feed/./1',
    '/feed/1?next=../sign-in',
    '/feed/%E0%A4%A',
    '/feed/add-post',
    '/update-password',
    '/(app)/style',
    '/%28app%29/settings',
  ])(
    'returns to %s after login',
    (path) => {
      expect(isReturnToPath(path)).toBe(true);
    },
  );

  it.each([
    '/',
    '',
    '/?ref=email',
    '/sign-in',
    '/www',
    '/..',
    '/%2e%2e',
    '/../sign-in',
    '/./sign-in',
    '/(app)/../forgot-password',
    '/%2e%2e/sign-in',
    '/sign%2Din',
    '/%73ign-in',
    '/(app)/%2e%2e/sign-in',
    '/feed/.%2E/sign-up',
    '/feed/%2e/../../onboarding',
    '/%66orgot-password',
    '/%28app%29/sign-up',
    '/_sitemap',
    '/onboarding',
  ])(
    'does not return to %s after login',
    (path) => {
      expect(isReturnToPath(path)).toBe(false);
    },
  );

  it.each([
    '/does-not-exist',
    '/feed',
    '/feed/1/comments',
    '/sign-in-help',
    '/Sign-In',
    '/(app)',
    '/index',
  ])('does not return to %s, which is not a protected screen', (path) => {
    expect(isReturnToPath(path)).toBe(false);
  });

  it.each([
    'RootstrapApp:////example.com/x',
    'RootstrapApp.staging:////example.com/x',
    'https://example.com//example.com/x',
    'RootstrapApp:///\\example.com/x',
    'exp://127.0.0.1:8081/--//example.com/x',
  ])('never returns to the external target in %s', (url) => {
    expect(isReturnToPath(toAppPath(url))).toBe(false);
  });

  it.each([
    'RootstrapApp.staging://x/../sign-in',
    'RootstrapApp.staging://feed/%2e%2e/forgot-password',
    'https://example.com/./sign-up',
  ])('does not return to the auth screen %s resolves to', (url) => {
    expect(isReturnToPath(toAppPath(url))).toBe(false);
  });
});

describe('isOnScreen', () => {
  it.each([
    [['sign-in'], AUTH_SCREENS],
    [['forgot-password'], AUTH_SCREENS],
    [['feed', '[id]'], AUTHENTICATED_SCREENS],
    [['feed', 'add-post'], AUTHENTICATED_SCREENS],
    [['(app)'], AUTHENTICATED_SCREENS],
    [['(app)', 'settings'], AUTHENTICATED_SCREENS],
    [['update-password'], AUTHENTICATED_SCREENS],
  ])('finds %j among the listed screens', (segments, screens) => {
    expect(isOnScreen(segments, screens)).toBe(true);
  });

  it.each([
    [['[...messing]'], AUTHENTICATED_SCREENS],
    [['www'], AUTHENTICATED_SCREENS],
    [['feed'], AUTHENTICATED_SCREENS],
    [['sign-in-help'], AUTH_SCREENS],
    [['feed', '[id]'], AUTH_SCREENS],
  ])('does not find %j among the listed screens', (segments, screens) => {
    expect(isOnScreen(segments, screens)).toBe(false);
  });
});

describe('route classification', () => {
  const appDirectory = path.join(__dirname, '../../../src/app');
  const PUBLIC_SCREENS = ['onboarding', 'www', '[...messing]'];

  function routeFiles(directory: string, prefix = ''): Array<string> {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const route = `${prefix}${entry.name}`;
      if (entry.isDirectory()) {
        return routeFiles(path.join(directory, entry.name), `${route}/`);
      }
      const name = route.replace(/\.tsx?$/, '');
      return /(?:^|\/)(?:_layout|\+[^/]+)$/.test(name) ? [] : [name];
    });
  }

  it.each(routeFiles(appDirectory))('classifies %s as an auth, authenticated, tab or public screen', (route) => {
    const tab = route.startsWith('(app)/') ? route.slice('(app)/'.length) : null;
    const isClassified = tab === null
      ? [...AUTH_SCREENS, ...AUTHENTICATED_SCREENS, ...PUBLIC_SCREENS].includes(route)
      : APP_TAB_SCREENS.includes(tab);

    expect(isClassified).toBe(true);
  });
});
