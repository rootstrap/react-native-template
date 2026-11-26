import { clearPendingDeepLink, setPendingDeepLink, usePendingDeepLink } from '@/lib/auth/pending-deep-link';

const pendingDeepLink = () => usePendingDeepLink.getState().path;

describe('pending deep link store', () => {
  beforeEach(() => {
    clearPendingDeepLink();
  });

  it('starts empty', () => {
    expect(pendingDeepLink()).toBeNull();
  });

  it('keeps the latest link', () => {
    setPendingDeepLink('/feed/1');
    setPendingDeepLink('/feed/2');

    expect(pendingDeepLink()).toBe('/feed/2');
  });

  it('forgets the link once cleared, even when cleared twice', () => {
    setPendingDeepLink('/feed/1');

    clearPendingDeepLink();
    clearPendingDeepLink();

    expect(pendingDeepLink()).toBeNull();
  });

  it.each(['//example.com/x', '/\\example.com/x', 'https://example.com/x'])(
    'refuses to keep %s and drops the older link',
    (path) => {
      setPendingDeepLink('/feed/1');

      setPendingDeepLink(path);

      expect(pendingDeepLink()).toBeNull();
    },
  );
});
