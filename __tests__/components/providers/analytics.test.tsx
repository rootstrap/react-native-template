import { renderHook, waitFor } from '@testing-library/react-native';

import { AnalyticsProvider, useAnalytics } from '@/components/providers/analytics';
import type { AnalyticsProviderAdapter } from '@/lib/analytics';
import { fireEvent, render, screen } from '@/lib/test-utils';
import { Text, TouchableOpacity, View } from '@/components/ui';

function createMockProvider(overrides: Partial<AnalyticsProviderAdapter> = {}) {
  return {
    init: jest.fn(),
    trackEvent: jest.fn(),
    trackScreen: jest.fn(),
    identify: jest.fn(),
    reset: jest.fn(),
    ...overrides,
  } satisfies AnalyticsProviderAdapter;
}

function renderAnalytics(providers: ReadonlyArray<AnalyticsProviderAdapter>) {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AnalyticsProvider providers={providers}>{children}</AnalyticsProvider>
  );
  return renderHook(() => useAnalytics(), { wrapper });
}

describe('AnalyticsProvider', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('initialises every provider once on mount', () => {
    const first = createMockProvider();
    const second = createMockProvider();

    const { rerender } = renderAnalytics([first, second]);
    rerender({});

    expect(first.init).toHaveBeenCalledTimes(1);
    expect(second.init).toHaveBeenCalledTimes(1);
  });

  it('fans out trackEvent to every provider', () => {
    const first = createMockProvider();
    const second = createMockProvider();
    const { result } = renderAnalytics([first, second]);

    result.current.trackEvent('BUTTON_PRESS', { accessibilityId: 'login-button' });

    expect(first.trackEvent).toHaveBeenCalledWith('BUTTON_PRESS', {
      accessibilityId: 'login-button',
    });
    expect(second.trackEvent).toHaveBeenCalledWith('BUTTON_PRESS', {
      accessibilityId: 'login-button',
    });
  });

  it('fans out trackScreen to every provider', () => {
    const first = createMockProvider();
    const second = createMockProvider();
    const { result } = renderAnalytics([first, second]);

    result.current.trackScreen('/feed', { tab: 'home' });

    expect(first.trackScreen).toHaveBeenCalledWith('/feed', { tab: 'home' });
    expect(second.trackScreen).toHaveBeenCalledWith('/feed', { tab: 'home' });
  });

  it('fans out identify and reset, skipping providers that do not implement them', () => {
    const full = createMockProvider();
    const minimal = createMockProvider({ identify: undefined, reset: undefined });
    const { result } = renderAnalytics([full, minimal]);

    result.current.identify('user-1', { plan: 'free' });
    result.current.reset();

    expect(full.identify).toHaveBeenCalledWith('user-1', { plan: 'free' });
    expect(full.reset).toHaveBeenCalledTimes(1);
  });

  it('isolates provider failures so the other providers still receive the call', async () => {
    const failing = createMockProvider({
      trackEvent: jest.fn(() => {
        throw new Error('vendor is down');
      }),
    });
    const rejecting = createMockProvider({
      trackScreen: jest.fn().mockRejectedValue(new Error('network')),
    });
    const healthy = createMockProvider();
    const { result } = renderAnalytics([failing, rejecting, healthy]);

    expect(() => {
      result.current.trackEvent('BUTTON_PRESS', { accessibilityId: 'login-button' });
      result.current.trackScreen('/feed');
    }).not.toThrow();

    expect(healthy.trackEvent).toHaveBeenCalledTimes(1);
    expect(healthy.trackScreen).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledTimes(2);
    });
  });

  it('rejects events that are not in the catalogue at compile time', () => {
    const provider = createMockProvider();
    const { result } = renderAnalytics([provider]);

    // @ts-expect-error unknown event names are not allowed
    result.current.trackEvent('NOT_IN_CATALOGUE', {});
    // @ts-expect-error params must match the catalogue entry
    result.current.trackEvent('BUTTON_PRESS', { wrong: true });

    expect(provider.trackEvent).toHaveBeenCalledTimes(2);
  });

  it('throws when useAnalytics is used outside of AnalyticsProvider', () => {
    expect(() => renderHook(() => useAnalytics())).toThrow(
      'useAnalytics must be used within an AnalyticsProvider',
    );
  });
});

describe('useAnalytics in a component', () => {
  it('tracks an event when the user presses a button', () => {
    const provider = createMockProvider();

    const TestComponent = () => {
      const analytics = useAnalytics();
      return (
        <View>
          <TouchableOpacity
            testID="track-button"
            onPress={() => analytics.trackEvent('BUTTON_PRESS', { accessibilityId: 'track-button' })}
          >
            <Text>Track</Text>
          </TouchableOpacity>
        </View>
      );
    };

    render(
      <AnalyticsProvider providers={[provider]}>
        <TestComponent />
      </AnalyticsProvider>,
    );

    fireEvent.press(screen.getByTestId('track-button'));

    expect(provider.trackEvent).toHaveBeenCalledWith('BUTTON_PRESS', {
      accessibilityId: 'track-button',
    });
  });
});
