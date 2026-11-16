import { useSegments } from 'expo-router';

import { AnalyticsScreenTracker } from '@/components/analytics-screen-tracker';
import { AnalyticsProvider } from '@/components/providers/analytics';
import type { AnalyticsProviderAdapter } from '@/lib/analytics';
import { render, waitFor } from '@/lib/test-utils';

jest.mock('expo-router', () => ({
  useSegments: jest.fn(),
}));

const mockUseSegments = useSegments as jest.MockedFunction<() => string[]>;

function createMockProvider(): AnalyticsProviderAdapter {
  return {
    init: jest.fn(),
    trackEvent: jest.fn(),
    trackScreen: jest.fn(),
  };
}

function renderTracker(providers: ReadonlyArray<AnalyticsProviderAdapter>) {
  const tree = () => (
    <AnalyticsProvider providers={providers}>
      <AnalyticsScreenTracker />
    </AnalyticsProvider>
  );
  const result = render(tree());
  return { ...result, rerender: () => result.rerender(tree()) };
}

describe('AnalyticsScreenTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks the current screen on mount', async () => {
    const provider = createMockProvider();
    mockUseSegments.mockReturnValue(['sign-in']);

    renderTracker([provider]);

    await waitFor(() => {
      expect(provider.trackScreen).toHaveBeenCalledWith('/sign-in', undefined);
    });
    expect(provider.trackScreen).toHaveBeenCalledTimes(1);
  });

  it('reports the route pattern, without route groups or dynamic values', async () => {
    const provider = createMockProvider();
    mockUseSegments.mockReturnValue(['(app)', 'feed', '[id]']);

    renderTracker([provider]);

    await waitFor(() => {
      expect(provider.trackScreen).toHaveBeenCalledWith('/feed/[id]', undefined);
    });
  });

  it('reports the index route of a group as the root screen', async () => {
    const provider = createMockProvider();
    mockUseSegments.mockReturnValue(['(app)']);

    renderTracker([provider]);

    await waitFor(() => {
      expect(provider.trackScreen).toHaveBeenCalledWith('/', undefined);
    });
  });

  it('tracks again when the route changes and not on unrelated re-renders', async () => {
    const provider = createMockProvider();
    mockUseSegments.mockReturnValue(['(app)', 'feed']);

    const { rerender } = renderTracker([provider]);
    mockUseSegments.mockReturnValue(['(app)', 'feed']);
    rerender();

    await waitFor(() => {
      expect(provider.trackScreen).toHaveBeenCalledTimes(1);
    });

    mockUseSegments.mockReturnValue(['(app)', 'settings']);
    rerender();

    await waitFor(() => {
      expect(provider.trackScreen).toHaveBeenCalledTimes(2);
    });
    expect(provider.trackScreen).toHaveBeenLastCalledWith('/settings', undefined);
  });

  it('renders nothing', () => {
    mockUseSegments.mockReturnValue([]);

    const { toJSON } = renderTracker([createMockProvider()]);

    expect(toJSON()).toBeNull();
  });
});
