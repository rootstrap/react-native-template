import { useSegments } from 'expo-router';

import { AnalyticsProvider } from '@/components/providers/analytics';
import {
  useAnalyticsScreenTracking,
  useAnalyticsSessionReset,
} from '@/components/providers/analytics-tracking';
import { useAuth } from '@/components/providers/auth';
import type { AnalyticsProviderAdapter } from '@/lib/analytics';
import { renderHook, waitFor } from '@/lib/test-utils';

jest.mock('expo-router', () => ({
  useSegments: jest.fn(),
}));

jest.mock('@/components/providers/auth', () => ({
  useAuth: jest.fn(),
}));

const mockUseSegments = useSegments as jest.MockedFunction<() => string[]>;
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
});

describe('useAnalyticsSessionReset', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it('does not reset when the app starts signed out', async () => {
    const provider = createMockProvider();
    mockAuthenticated(false);
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
    expect(provider.reset).not.toHaveBeenCalled();
  });
});
