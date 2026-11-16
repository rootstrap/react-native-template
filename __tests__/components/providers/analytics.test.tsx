import {
  ANALYTICS_TIMEOUT_MS,
  AnalyticsProvider,
  useAnalytics,
} from '@/components/providers/analytics';
import type { AnalyticsProviderAdapter } from '@/lib/analytics';
import { clearUserIdentified, hasIdentifiedUser } from '@/lib/analytics';
import { fireEvent, render, renderHook, screen, waitFor } from '@/lib/test-utils';
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

async function flushPromises() {
  await new Promise(resolve => setImmediate(resolve));
}

describe('AnalyticsProvider', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('initialises every provider once on mount', async () => {
    const first = createMockProvider();
    const second = createMockProvider();

    const { rerender } = renderAnalytics([first, second]);
    rerender({});

    await waitFor(() => {
      expect(first.init).toHaveBeenCalledTimes(1);
      expect(second.init).toHaveBeenCalledTimes(1);
    });
  });

  it('waits for init to finish before forwarding calls', async () => {
    let finishInit!: () => void;
    const provider = createMockProvider({
      init: jest.fn(async () => new Promise<void>((resolve) => {
        finishInit = resolve;
      })),
    });
    const { result } = renderAnalytics([provider]);

    result.current.trackScreen('/feed');
    await flushPromises();
    expect(provider.trackScreen).not.toHaveBeenCalled();

    finishInit();
    await waitFor(() => {
      expect(provider.trackScreen).toHaveBeenCalledWith('/feed', undefined);
    });
  });

  it('skips providers whose init failed without blocking the others', async () => {
    const broken = createMockProvider({
      init: jest.fn(() => {
        throw new Error('missing api key');
      }),
    });
    const healthy = createMockProvider();
    const { result } = renderAnalytics([broken, healthy]);

    result.current.trackScreen('/feed');

    await waitFor(() => {
      expect(healthy.trackScreen).toHaveBeenCalledTimes(1);
    });
    expect(broken.trackScreen).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it('gives up on a provider whose init never settles', async () => {
    jest.useFakeTimers();
    try {
      const hanging = createMockProvider({ init: jest.fn(async () => new Promise<void>(() => undefined)) });
      const healthy = createMockProvider();
      const { result } = renderAnalytics([hanging, healthy]);

      result.current.trackScreen('/feed');
      await jest.advanceTimersByTimeAsync(ANALYTICS_TIMEOUT_MS);

      expect(healthy.trackScreen).toHaveBeenCalledTimes(1);
      expect(hanging.trackScreen).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledTimes(1);
    }
    finally {
      jest.useRealTimers();
    }
  });

  it('finishes a reset before forwarding later calls to the same provider', async () => {
    const calls: string[] = [];
    let finishReset!: () => void;
    const provider = createMockProvider({
      reset: jest.fn(async () => new Promise<void>((resolve) => {
        finishReset = () => {
          calls.push('reset');
          resolve();
        };
      })),
      trackScreen: jest.fn(() => {
        calls.push('trackScreen');
      }),
    });
    const { result } = renderAnalytics([provider]);

    result.current.reset();
    result.current.trackScreen('/sign-in');

    await waitFor(() => {
      expect(provider.reset).toHaveBeenCalledTimes(1);
    });
    await flushPromises();
    expect(provider.trackScreen).not.toHaveBeenCalled();

    finishReset();
    await waitFor(() => {
      expect(calls).toEqual(['reset', 'trackScreen']);
    });
  });

  it('does not hold later calls behind an event that never settles', async () => {
    const provider = createMockProvider({
      trackEvent: jest.fn(async () => new Promise<void>(() => undefined)),
    });
    const { result } = renderAnalytics([provider]);

    result.current.trackEvent('BUTTON_PRESS', { accessibilityId: 'login-button' });
    result.current.trackScreen('/feed');
    result.current.reset();

    await waitFor(() => {
      expect(provider.trackScreen).toHaveBeenCalledWith('/feed', undefined);
      expect(provider.reset).toHaveBeenCalledTimes(1);
    });
  });

  it('releases calls queued behind a reset that never settles after the timeout', async () => {
    jest.useFakeTimers();
    try {
      const provider = createMockProvider({
        reset: jest.fn(async () => new Promise<void>(() => undefined)),
      });
      const { result } = renderAnalytics([provider]);

      result.current.reset();
      result.current.trackScreen('/sign-in');
      await jest.advanceTimersByTimeAsync(0);
      expect(provider.trackScreen).not.toHaveBeenCalled();

      await jest.advanceTimersByTimeAsync(ANALYTICS_TIMEOUT_MS);
      expect(provider.trackScreen).toHaveBeenCalledWith('/sign-in', undefined);
      expect(console.error).toHaveBeenCalledTimes(1);
    }
    finally {
      jest.useRealTimers();
    }
  });

  it('remembers whether a user was identified until reset', () => {
    clearUserIdentified();
    const { result } = renderAnalytics([]);

    result.current.identify('user-1');
    expect(hasIdentifiedUser()).toBe(true);

    result.current.reset();
    expect(hasIdentifiedUser()).toBe(false);
  });

  it('does not log provider failures in production', async () => {
    const globals = globalThis as unknown as { __DEV__: boolean };
    const previousDev = globals.__DEV__;
    globals.__DEV__ = false;
    try {
      const failing = createMockProvider({
        trackScreen: jest.fn(() => {
          throw new Error('failed for user-1');
        }),
      });
      const { result } = renderAnalytics([failing]);

      result.current.trackScreen('/feed');

      await waitFor(() => {
        expect(failing.trackScreen).toHaveBeenCalledTimes(1);
      });
      await flushPromises();
      expect(console.error).not.toHaveBeenCalled();
    }
    finally {
      globals.__DEV__ = previousDev;
    }
  });

  it('fans out trackEvent to every provider', async () => {
    const first = createMockProvider();
    const second = createMockProvider();
    const { result } = renderAnalytics([first, second]);

    result.current.trackEvent('BUTTON_PRESS', { accessibilityId: 'login-button' });

    await waitFor(() => {
      expect(first.trackEvent).toHaveBeenCalledWith('BUTTON_PRESS', {
        accessibilityId: 'login-button',
      });
      expect(second.trackEvent).toHaveBeenCalledWith('BUTTON_PRESS', {
        accessibilityId: 'login-button',
      });
    });
  });

  it('fans out trackScreen to every provider', async () => {
    const first = createMockProvider();
    const second = createMockProvider();
    const { result } = renderAnalytics([first, second]);

    result.current.trackScreen('/feed', { tab: 'home' });

    await waitFor(() => {
      expect(first.trackScreen).toHaveBeenCalledWith('/feed', { tab: 'home' });
      expect(second.trackScreen).toHaveBeenCalledWith('/feed', { tab: 'home' });
    });
  });

  it('fans out identify and reset, skipping providers that do not implement them', async () => {
    const full = createMockProvider();
    const minimal = createMockProvider({ identify: undefined, reset: undefined });
    const { result } = renderAnalytics([full, minimal]);

    result.current.identify('user-1', { plan: 'free' });
    result.current.reset();

    await waitFor(() => {
      expect(full.identify).toHaveBeenCalledWith('user-1', { plan: 'free' });
      expect(full.reset).toHaveBeenCalledTimes(1);
    });
    await flushPromises();
    expect(console.error).not.toHaveBeenCalled();
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

    await waitFor(() => {
      expect(healthy.trackEvent).toHaveBeenCalledTimes(1);
      expect(healthy.trackScreen).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(2);
    });
  });

  it('rejects events that are not in the catalogue at compile time', async () => {
    const provider = createMockProvider();
    const { result } = renderAnalytics([provider]);

    // @ts-expect-error unknown event names are not allowed
    result.current.trackEvent('NOT_IN_CATALOGUE', {});
    // @ts-expect-error params must match the catalogue entry
    result.current.trackEvent('BUTTON_PRESS', { wrong: true });

    await waitFor(() => {
      expect(provider.trackEvent).toHaveBeenCalledTimes(2);
    });
  });

  it('throws when useAnalytics is used outside of AnalyticsProvider', () => {
    expect(() => renderHook(() => useAnalytics())).toThrow(
      'useAnalytics must be used within an AnalyticsProvider',
    );
  });
});

describe('useAnalytics in a component', () => {
  it('tracks an event when the user presses a button', async () => {
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

    await waitFor(() => {
      expect(provider.trackEvent).toHaveBeenCalledWith('BUTTON_PRESS', {
        accessibilityId: 'track-button',
      });
    });
  });
});
