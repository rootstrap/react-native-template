import { useGlobalSearchParams, useSegments } from 'expo-router';

import { AnalyticsProvider } from '@/components/providers/analytics';
import {
  useAnalyticsScreenTracking,
  useAnalyticsSessionReset,
} from '@/components/providers/analytics-tracking';
import { useAuth } from '@/components/providers/auth';
import type { AnalyticsProviderAdapter } from '@/lib/analytics';
import { clearUserIdentified, hasIdentifiedUser, markUserIdentified } from '@/lib/analytics';
import { renderHook, waitFor } from '@/lib/test-utils';

jest.mock('expo-router', () => ({
  useGlobalSearchParams: jest.fn(),
  useSegments: jest.fn(),
}));

jest.mock('@/components/providers/auth', () => ({
  useAuth: jest.fn(),
}));

const mockUseSegments = useSegments as jest.MockedFunction<() => string[]>;
const mockUseGlobalSearchParams = useGlobalSearchParams as jest.MockedFunction<
  () => Record<string, string | Array<string> | undefined>
>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

function mockAuthenticated(isAuthenticated: boolean) {
  mockUseAuth.mockReturnValue({
    token: isAuthenticated ? 'token' : null,
    isAuthenticated,
    loading: false,
    ready: true,
    logout: jest.fn(),
  });
}

function createMockProvider() {
  return {
    init: jest.fn(),
    trackEvent: jest.fn(),
    trackScreen: jest.fn(),
    reset: jest.fn(),
  } satisfies AnalyticsProviderAdapter;
}

function renderWithAnalytics(hook: () => void, providers: ReadonlyArray<AnalyticsProviderAdapter>) {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AnalyticsProvider providers={providers}>{children}</AnalyticsProvider>
  );
  return renderHook(hook, { wrapper });
}

describe('useAnalyticsScreenTracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGlobalSearchParams.mockReturnValue({});
  });

  it('tracks the current screen on mount', async () => {
    const provider = createMockProvider();
    mockUseSegments.mockReturnValue(['sign-in']);

    renderWithAnalytics(useAnalyticsScreenTracking, [provider]);

    await waitFor(() => {
      expect(provider.trackScreen).toHaveBeenCalledWith('/sign-in', undefined);
    });
    expect(provider.trackScreen).toHaveBeenCalledTimes(1);
  });

  it('reports the route pattern, without route groups or dynamic values', async () => {
    const provider = createMockProvider();
    mockUseSegments.mockReturnValue(['(app)', 'feed', '[id]']);

    renderWithAnalytics(useAnalyticsScreenTracking, [provider]);

    await waitFor(() => {
      expect(provider.trackScreen).toHaveBeenCalledWith('/feed/[id]', undefined);
    });
  });

  it('sends the route params along with the route pattern', async () => {
    const provider = createMockProvider();
    mockUseSegments.mockReturnValue(['(app)', 'feed', '[id]']);
    mockUseGlobalSearchParams.mockReturnValue({ id: '42', tab: 'comments' });

    renderWithAnalytics(useAnalyticsScreenTracking, [provider]);

    await waitFor(() => {
      expect(provider.trackScreen).toHaveBeenCalledWith('/feed/[id]', { id: '42', tab: 'comments' });
    });
  });

  it('joins repeated params with commas and drops undefined values', async () => {
    const provider = createMockProvider();
    mockUseSegments.mockReturnValue(['(app)', 'feed']);
    mockUseGlobalSearchParams.mockReturnValue({ tag: ['news', 'sports'], page: undefined });

    renderWithAnalytics(useAnalyticsScreenTracking, [provider]);

    await waitFor(() => {
      expect(provider.trackScreen).toHaveBeenCalledWith('/feed', { tag: 'news,sports' });
    });
  });

  it('does not send the URL fragment', async () => {
    const provider = createMockProvider();
    mockUseSegments.mockReturnValue(['(app)', 'feed']);
    mockUseGlobalSearchParams.mockReturnValue({ '#': 'access_token=secret', 'tab': 'comments' });

    renderWithAnalytics(useAnalyticsScreenTracking, [provider]);

    await waitFor(() => {
      expect(provider.trackScreen).toHaveBeenCalledWith('/feed', { tab: 'comments' });
    });
  });

  it('converts primitive values to strings and drops nested objects', async () => {
    const provider = createMockProvider();
    mockUseSegments.mockReturnValue(['(app)', 'feed']);
    (mockUseGlobalSearchParams as jest.Mock).mockReturnValue({
      page: 2,
      draft: false,
      filter: { status: 'open' },
      empty: null,
      none: [],
    });

    renderWithAnalytics(useAnalyticsScreenTracking, [provider]);

    await waitFor(() => {
      expect(provider.trackScreen).toHaveBeenCalledWith('/feed', { draft: 'false', page: '2' });
    });
  });

  it('tracks again when only the params change', async () => {
    const provider = createMockProvider();
    mockUseSegments.mockReturnValue(['(app)', 'feed', '[id]']);
    mockUseGlobalSearchParams.mockReturnValue({ id: '1' });

    const { rerender } = renderWithAnalytics(useAnalyticsScreenTracking, [provider]);
    await waitFor(() => {
      expect(provider.trackScreen).toHaveBeenCalledTimes(1);
    });

    mockUseGlobalSearchParams.mockReturnValue({ id: '2' });
    rerender({});

    await waitFor(() => {
      expect(provider.trackScreen).toHaveBeenCalledTimes(2);
    });
    expect(provider.trackScreen).toHaveBeenLastCalledWith('/feed/[id]', { id: '2' });
  });

  it('does not track again when the same params come back in a new object or order', async () => {
    const provider = createMockProvider();
    mockUseSegments.mockReturnValue(['(app)', 'feed', '[id]']);
    mockUseGlobalSearchParams.mockReturnValue({ id: '1', tab: 'comments' });

    const { rerender } = renderWithAnalytics(useAnalyticsScreenTracking, [provider]);
    await waitFor(() => {
      expect(provider.trackScreen).toHaveBeenCalledTimes(1);
    });

    mockUseGlobalSearchParams.mockReturnValue({ tab: 'comments', id: '1' });
    rerender({});
    // Wait past the tracker's setTimeout so a wrongly scheduled report would land.
    await new Promise(resolve => setTimeout(resolve, 20));

    expect(provider.trackScreen).toHaveBeenCalledTimes(1);
  });

  it('does not track again when the params change and come back within the same tick', async () => {
    const provider = createMockProvider();
    mockUseSegments.mockReturnValue(['(app)', 'feed', '[id]']);
    mockUseGlobalSearchParams.mockReturnValue({ id: '1' });

    const { rerender } = renderWithAnalytics(useAnalyticsScreenTracking, [provider]);
    await waitFor(() => {
      expect(provider.trackScreen).toHaveBeenCalledTimes(1);
    });

    mockUseGlobalSearchParams.mockReturnValue({ id: '2' });
    rerender({});
    mockUseGlobalSearchParams.mockReturnValue({ id: '1' });
    rerender({});
    // Wait past the tracker's setTimeout so a wrongly scheduled report would land.
    await new Promise(resolve => setTimeout(resolve, 20));

    expect(provider.trackScreen).toHaveBeenCalledTimes(1);
  });

  it('sorts params by name in code unit order', async () => {
    const provider = createMockProvider();
    mockUseSegments.mockReturnValue(['(app)', 'feed']);
    mockUseGlobalSearchParams.mockReturnValue({ b: '2', a: '1', B: '3' });

    renderWithAnalytics(useAnalyticsScreenTracking, [provider]);

    await waitFor(() => {
      expect(provider.trackScreen).toHaveBeenCalledTimes(1);
    });
    expect(Object.keys(provider.trackScreen.mock.calls[0][1])).toEqual(['B', 'a', 'b']);
  });

  // Route params only carry ids, modes and similar values by design, so the
  // default sends all of them without filtering by name or value.
  it('sends every route param by default', async () => {
    const provider = createMockProvider();
    mockUseSegments.mockReturnValue(['(app)', 'feed', '[id]']);
    mockUseGlobalSearchParams.mockReturnValue({ id: '42', mode: 'edit', tab: 'comments', ref: 'home' });

    renderWithAnalytics(useAnalyticsScreenTracking, [provider]);

    await waitFor(() => {
      expect(provider.trackScreen).toHaveBeenCalledWith('/feed/[id]', { id: '42', mode: 'edit', ref: 'home', tab: 'comments' });
    });
  });

  it('sends no params when param tracking is turned off', async () => {
    const provider = createMockProvider();
    mockUseSegments.mockReturnValue(['(app)', 'feed', '[id]']);
    mockUseGlobalSearchParams.mockReturnValue({ id: '42', tab: 'comments' });

    renderWithAnalytics(() => useAnalyticsScreenTracking({ trackParams: false }), [provider]);

    await waitFor(() => {
      expect(provider.trackScreen).toHaveBeenCalledWith('/feed/[id]', undefined);
    });
  });

  it('sends only the params accepted by a trackParams function', async () => {
    const provider = createMockProvider();
    mockUseSegments.mockReturnValue(['(app)', 'feed', '[id]']);
    mockUseGlobalSearchParams.mockReturnValue({ id: '42', tab: 'comments' });

    renderWithAnalytics(() => useAnalyticsScreenTracking({ trackParams: name => name === 'tab' }), [provider]);

    await waitFor(() => {
      expect(provider.trackScreen).toHaveBeenCalledWith('/feed/[id]', { tab: 'comments' });
    });
  });

  it('does not track again when only a param rejected by trackParams changes', async () => {
    const provider = createMockProvider();
    mockUseSegments.mockReturnValue(['(app)', 'feed', '[id]']);
    mockUseGlobalSearchParams.mockReturnValue({ id: '42', tab: 'comments' });

    const { rerender } = renderWithAnalytics(() => useAnalyticsScreenTracking({ trackParams: name => name === 'tab' }), [provider]);
    await waitFor(() => {
      expect(provider.trackScreen).toHaveBeenCalledTimes(1);
    });

    mockUseGlobalSearchParams.mockReturnValue({ id: '43', tab: 'comments' });
    rerender({});
    // Wait past the tracker's setTimeout so a wrongly scheduled report would land.
    await new Promise(resolve => setTimeout(resolve, 20));

    expect(provider.trackScreen).toHaveBeenCalledTimes(1);
  });

  it('reports the index route of a group as the root screen', async () => {
    const provider = createMockProvider();
    mockUseSegments.mockReturnValue(['(app)']);

    renderWithAnalytics(useAnalyticsScreenTracking, [provider]);

    await waitFor(() => {
      expect(provider.trackScreen).toHaveBeenCalledWith('/', undefined);
    });
  });

  it('tracks again when the route changes and not on unrelated re-renders', async () => {
    const provider = createMockProvider();
    mockUseSegments.mockReturnValue(['(app)', 'feed']);

    const { rerender } = renderWithAnalytics(useAnalyticsScreenTracking, [provider]);
    mockUseSegments.mockReturnValue(['(app)', 'feed']);
    rerender({});

    await waitFor(() => {
      expect(provider.trackScreen).toHaveBeenCalledTimes(1);
    });

    mockUseSegments.mockReturnValue(['(app)', 'settings']);
    rerender({});

    await waitFor(() => {
      expect(provider.trackScreen).toHaveBeenCalledTimes(2);
    });
    expect(provider.trackScreen).toHaveBeenLastCalledWith('/settings', undefined);
  });

  it('reports only the redirect target when the route changes within the same tick', async () => {
    const provider = createMockProvider();
    mockUseSegments.mockReturnValue(['(app)']);

    const { rerender } = renderWithAnalytics(useAnalyticsScreenTracking, [provider]);
    mockUseSegments.mockReturnValue(['sign-in']);
    rerender({});

    await waitFor(() => {
      expect(provider.trackScreen).toHaveBeenCalledWith('/sign-in', undefined);
    });
    await new Promise(resolve => setImmediate(resolve));
    expect(provider.trackScreen).toHaveBeenCalledTimes(1);
  });

  it('does not report the same screen again when the providers array changes identity', async () => {
    const provider = createMockProvider();
    mockUseSegments.mockReturnValue(['(app)', 'settings']);
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AnalyticsProvider providers={[provider]}>{children}</AnalyticsProvider>
    );

    const { rerender } = renderHook(useAnalyticsScreenTracking, { wrapper });
    await waitFor(() => {
      expect(provider.trackScreen).toHaveBeenCalledTimes(1);
    });

    rerender({});
    rerender({});
    await new Promise(resolve => setImmediate(resolve));

    expect(provider.trackScreen).toHaveBeenCalledTimes(1);
    expect(provider.init).toHaveBeenCalledTimes(1);
  });
});

describe('useAnalyticsSessionReset', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearUserIdentified();
  });

  it('resets analytics when the user signs out', async () => {
    const provider = createMockProvider();
    mockAuthenticated(true);
    const { rerender } = renderWithAnalytics(useAnalyticsSessionReset, [provider]);

    mockAuthenticated(false);
    rerender({});

    await waitFor(() => {
      expect(provider.reset).toHaveBeenCalledTimes(1);
    });
  });

  it('resets analytics when the app starts signed out after a user was identified', async () => {
    const provider = createMockProvider();
    markUserIdentified();
    mockAuthenticated(false);
    const { rerender } = renderWithAnalytics(useAnalyticsSessionReset, [provider]);
    rerender({});

    await waitFor(() => {
      expect(provider.reset).toHaveBeenCalledTimes(1);
    });
    expect(hasIdentifiedUser()).toBe(false);
  });

  it('does not reset when the app starts signed out and no user was identified', async () => {
    const provider = createMockProvider();
    mockAuthenticated(false);
    const { rerender } = renderWithAnalytics(useAnalyticsSessionReset, [provider]);
    rerender({});

    await waitFor(() => {
      expect(provider.init).toHaveBeenCalledTimes(1);
    });
    await new Promise(resolve => setImmediate(resolve));
    expect(provider.reset).not.toHaveBeenCalled();
  });

  it('does not reset when the app starts signed in', async () => {
    const provider = createMockProvider();
    mockAuthenticated(true);
    const { rerender } = renderWithAnalytics(useAnalyticsSessionReset, [provider]);
    rerender({});

    await waitFor(() => {
      expect(provider.init).toHaveBeenCalledTimes(1);
    });
    expect(provider.reset).not.toHaveBeenCalled();
  });

  it('does not reset when the user signs in', async () => {
    const provider = createMockProvider();
    mockAuthenticated(false);
    const { rerender } = renderWithAnalytics(useAnalyticsSessionReset, [provider]);

    mockAuthenticated(true);
    rerender({});

    await waitFor(() => {
      expect(provider.init).toHaveBeenCalledTimes(1);
    });
    await new Promise(resolve => setImmediate(resolve));
    expect(provider.reset).not.toHaveBeenCalled();
  });
});
