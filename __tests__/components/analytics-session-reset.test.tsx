import { AnalyticsSessionReset } from '@/components/analytics-session-reset';
import { AnalyticsProvider } from '@/components/providers/analytics';
import { useAuth } from '@/components/providers/auth';
import type { AnalyticsProviderAdapter } from '@/lib/analytics';
import { render, waitFor } from '@/lib/test-utils';

jest.mock('@/components/providers/auth', () => ({
  useAuth: jest.fn(),
}));

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

function renderSessionReset(providers: ReadonlyArray<AnalyticsProviderAdapter>) {
  const tree = () => (
    <AnalyticsProvider providers={providers}>
      <AnalyticsSessionReset />
    </AnalyticsProvider>
  );
  const result = render(tree());
  return { rerender: () => result.rerender(tree()) };
}

describe('AnalyticsSessionReset', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resets analytics when the user signs out', async () => {
    const provider = createMockProvider();
    mockAuthenticated(true);
    const { rerender } = renderSessionReset([provider]);

    mockAuthenticated(false);
    rerender();

    await waitFor(() => {
      expect(provider.reset).toHaveBeenCalledTimes(1);
    });
  });

  it('does not reset when the app starts signed out', async () => {
    const provider = createMockProvider();
    mockAuthenticated(false);
    const { rerender } = renderSessionReset([provider]);
    rerender();

    await waitFor(() => {
      expect(provider.init).toHaveBeenCalledTimes(1);
    });
    expect(provider.reset).not.toHaveBeenCalled();
  });

  it('does not reset when the user signs in', async () => {
    const provider = createMockProvider();
    mockAuthenticated(false);
    const { rerender } = renderSessionReset([provider]);

    mockAuthenticated(true);
    rerender();

    await waitFor(() => {
      expect(provider.init).toHaveBeenCalledTimes(1);
    });
    expect(provider.reset).not.toHaveBeenCalled();
  });
});
