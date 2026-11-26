import { redirectSystemPath } from '@/app/+native-intent';
import { clearPendingDeepLink, setPendingDeepLink, usePendingDeepLink } from '@/lib/auth/pending-deep-link';

const pendingDeepLink = () => usePendingDeepLink.getState().path;

describe('redirectSystemPath', () => {
  beforeEach(() => {
    clearPendingDeepLink();
  });

  it.each([true, false])('remembers a protected link and opens it unchanged (initial: %s)', (initial) => {
    const path = 'RootstrapApp.staging://feed/1?ref=email';

    expect(redirectSystemPath({ path, initial })).toBe(path);
    expect(pendingDeepLink()).toBe('/feed/1?ref=email');
  });

  it('opens a public link without remembering it', () => {
    const path = 'RootstrapApp.staging://forgot-password';

    expect(redirectSystemPath({ path, initial: true })).toBe(path);
    expect(pendingDeepLink()).toBeNull();
  });

  it('replaces an older pending link when a public link arrives', () => {
    setPendingDeepLink('/feed/1');

    redirectSystemPath({ path: 'RootstrapApp.staging://sign-up', initial: false });

    expect(pendingDeepLink()).toBeNull();
  });

  it('does not remember a plain app launch', () => {
    redirectSystemPath({ path: 'RootstrapApp.staging://', initial: true });

    expect(pendingDeepLink()).toBeNull();
  });

  it('returns malformed input unchanged without throwing', () => {
    const path = null as unknown as string;

    expect(() => redirectSystemPath({ path, initial: true })).not.toThrow();
    expect(redirectSystemPath({ path, initial: true })).toBeNull();
    expect(pendingDeepLink()).toBeNull();
  });

  it('forgets an older pending link when the new link cannot be read', () => {
    setPendingDeepLink('/feed/1');

    redirectSystemPath({ path: null as unknown as string, initial: false });

    expect(pendingDeepLink()).toBeNull();
  });

  it.each([
    'RootstrapApp.staging://x/../sign-in',
    'RootstrapApp.staging:///%2e%2e/forgot-password',
  ])('forgets an older pending link when %s resolves to an auth screen', (path) => {
    setPendingDeepLink('/feed/1');

    expect(redirectSystemPath({ path, initial: false })).toBe(path);
    expect(pendingDeepLink()).toBeNull();
  });

  it.each([
    'RootstrapApp.staging:////example.com/x',
    'https://example.com//example.com/x',
    'RootstrapApp.staging:///\\example.com/x',
  ])('does not remember the external target in %s', (path) => {
    setPendingDeepLink('/feed/1');

    expect(redirectSystemPath({ path, initial: true })).toBe(path);
    expect(pendingDeepLink()).toBeNull();
  });
});
