import { usePathname } from 'expo-router';

import { AnalyticsScreenTracker } from '@/components/analytics-screen-tracker';
import { AnalyticsProvider } from '@/components/providers/analytics';
import type { AnalyticsProviderAdapter } from '@/lib/analytics';
import { render } from '@/lib/test-utils';

jest.mock('expo-router', () => ({
  usePathname: jest.fn(),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

function createMockProvider(): AnalyticsProviderAdapter {
  return {
    init: jest.fn(),
    trackEvent: jest.fn(),
    trackScreen: jest.fn(),
  };
}

describe('AnalyticsScreenTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks the current screen on mount', () => {
    const provider = createMockProvider();
    mockUsePathname.mockReturnValue('/sign-in');

    render(
      <AnalyticsProvider providers={[provider]}>
        <AnalyticsScreenTracker />
      </AnalyticsProvider>,
    );

    expect(provider.trackScreen).toHaveBeenCalledTimes(1);
    expect(provider.trackScreen).toHaveBeenCalledWith('/sign-in', undefined);
  });

  it('tracks again when the route changes and not on unrelated re-renders', () => {
    const provider = createMockProvider();
    const providers = [provider];
    mockUsePathname.mockReturnValue('/feed');

    const { rerender } = render(
      <AnalyticsProvider providers={providers}>
        <AnalyticsScreenTracker />
      </AnalyticsProvider>,
    );

    rerender(
      <AnalyticsProvider providers={providers}>
        <AnalyticsScreenTracker />
      </AnalyticsProvider>,
    );
    expect(provider.trackScreen).toHaveBeenCalledTimes(1);

    mockUsePathname.mockReturnValue('/settings');
    rerender(
      <AnalyticsProvider providers={providers}>
        <AnalyticsScreenTracker />
      </AnalyticsProvider>,
    );

    expect(provider.trackScreen).toHaveBeenCalledTimes(2);
    expect(provider.trackScreen).toHaveBeenLastCalledWith('/settings', undefined);
  });

  it('renders nothing', () => {
    mockUsePathname.mockReturnValue('/');

    const { toJSON } = render(
      <AnalyticsProvider providers={[createMockProvider()]}>
        <AnalyticsScreenTracker />
      </AnalyticsProvider>,
    );

    expect(toJSON()).toBeNull();
  });
});
